package com.campusmatch.service;

import com.campusmatch.dto.*;
import com.campusmatch.entity.*;
import com.campusmatch.security.StudentIdPrivacy;
import com.campusmatch.repository.ApplicationRepository;
import com.campusmatch.repository.GroupMemberRepository;
import com.campusmatch.repository.GroupRepository;
import com.campusmatch.repository.NotificationRepository;
import com.campusmatch.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /**
     * Tạo nhóm học tập mới (Người tạo tự động là LEADER)
     */
    @Transactional
    public GroupDetailResponse createGroup(CreateGroupRequest request, String studentId) {
        log.info("Bắt đầu tạo nhóm học tập mới bởi sinh viên MSSV: {}", studentId);

        User leader = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        // 1. Tạo thực thể StudyGroup kế thừa khoa/viện từ u-SAINT của Leader
        StudyGroup group = StudyGroup.builder()
                .leader(leader)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .college(leader.getFaculty() != null ? leader.getFaculty() : "Chưa xác định")
                .department(leader.getDepartment() != null ? leader.getDepartment() : "Chưa xác định")
                .postYear(LocalDate.now().getYear())
                .courseCode(StringUtils.hasText(request.getCourseCode()) ? request.getCourseCode().trim() : null)
                .courseName(StringUtils.hasText(request.getCourseName()) ? request.getCourseName().trim() : null)
                .maxMembers(request.getMaxMembers())
                .status(GroupStatus.RECRUITING)
                .build();

        StudyGroup savedGroup = groupRepository.save(group);

        // 2. Tự động thêm Leader vào bảng group_members
        GroupMember leaderMember = GroupMember.builder()
                .id(new GroupMemberId(savedGroup.getId(), leader.getId()))
                .group(savedGroup)
                .user(leader)
                .role(GroupRole.LEADER)
                .joinedAt(LocalDateTime.now())
                .build();

        groupMemberRepository.save(leaderMember);
        log.info("Đã tạo nhóm thành công với ID: {}", savedGroup.getId());

        return mapToDetailResponse(savedGroup);
    }

    /**
     * Xóa nhóm học tập (Chỉ dành cho Trưởng nhóm / Leader)
     * Kèm xác nhận, gỡ liên kết thông báo, hủy đơn đăng ký và thông báo cho các thành viên.
     */
    @Transactional
    public void deleteGroup(Long groupId, String studentId) {
        log.info("Yêu cầu xóa nhóm ID: {} từ sinh viên MSSV: {}", groupId, studentId);

        User currentUser = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người dùng"));

        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm với ID: " + groupId));

        // Kiểm tra quyền: Chỉ Leader của nhóm mới có quyền xóa nhóm
        if (!group.getLeader().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải là Trưởng nhóm nên không có quyền xóa nhóm này");
        }

        // 1. Gửi thông báo cho tất cả thành viên khác trước khi giải tán nhóm
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        for (GroupMember member : members) {
            if (!member.getUser().getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        member.getUser(),
                        currentUser,
                        NotificationType.GROUP_DELETED,
                        "Nhóm đã bị giải tán",
                        String.format("Trưởng nhóm %s đã giải tán nhóm học tập \"%s\".", currentUser.getName(), group.getTitle()),
                        "/manage",
                        null
                );
            }
        }

        // 2. Gỡ liên kết group trong các notification cũ để tránh lỗi foreign key constraint
        notificationRepository.nullifyGroupReference(groupId);

        // 3. Xóa tất cả đơn ứng tuyển của nhóm
        applicationRepository.deleteByGroupId(groupId);

        // 4. Xóa tất cả thành viên của nhóm
        groupMemberRepository.deleteByGroupId(groupId);

        // 5. Xóa nhóm
        groupRepository.delete(group);
        log.info("Đã xóa nhóm ID: {} thành công", groupId);
    }

    /**
     * Lấy danh sách các năm có nhóm tồn tại trong DB (cho Year filter dropdown).
     * Trả về sorted giảm dần, VD: [2026, 2025, 2024]
     */
    @Transactional(readOnly = true)
    public List<Integer> getAvailableYears() {
        return groupRepository.findDistinctPostYears();
    }

    /**
     * Tìm kiếm & lọc nhóm học tập có phân trang
     */
    @Transactional(readOnly = true)
    public Page<GroupSummaryResponse> getGroups(
            String keyword,
            String college,
            String department,
            Integer postYear,
            GroupStatus status,
            Pageable pageable) {

        Specification<StudyGroup> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("courseCode")), searchPattern);
                Predicate nameMatch = cb.like(cb.lower(root.get("courseName")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch, codeMatch, nameMatch));
            }

            if (StringUtils.hasText(college) && !"All Colleges".equalsIgnoreCase(college.trim())) {
                predicates.add(cb.equal(root.get("college"), college.trim()));
            }

            if (StringUtils.hasText(department) && !"All Departments".equalsIgnoreCase(department.trim())) {
                predicates.add(cb.equal(root.get("department"), department.trim()));
            }

            if (postYear != null) {
                predicates.add(cb.equal(root.get("postYear"), postYear));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StudyGroup> groupPage = groupRepository.findAll(spec, pageable);

        return groupPage.map(group -> {
            long memberCount = groupMemberRepository.countByGroupId(group.getId());
            return GroupSummaryResponse.builder()
                    .id(group.getId())
                    .title(group.getTitle())
                    .description(group.getDescription())
                    .college(group.getCollege())
                    .department(group.getDepartment())
                    .postYear(group.getPostYear())
                    .courseCode(group.getCourseCode())
                    .courseName(group.getCourseName())
                    .maxMembers(group.getMaxMembers())
                    .memberCount(memberCount)
                    .status(group.getStatus())
                    .leader(mapToUserSummary(group.getLeader()))
                    .createdAt(group.getCreatedAt())
                    .updatedAt(group.getUpdatedAt())
                    .build();
        });
    }

    /**
     * Lấy chi tiết một nhóm theo ID kèm danh sách thành viên
     */
    @Transactional(readOnly = true)
    public GroupDetailResponse getGroupDetail(Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm với ID: " + groupId));

        return mapToDetailResponse(group);
    }

    /**
     * Lấy danh sách nhóm của tôi (Leader & Thành viên)
     */
    @Transactional(readOnly = true)
    public List<MyGroupSummaryResponse> getMyGroups(String studentId) {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        List<GroupMember> memberships = groupMemberRepository.findByUserId(user.getId());

        return memberships.stream().map(membership -> {
            StudyGroup group = membership.getGroup();
            String myRole = membership.getRole().name();

            List<GroupMember> allMembers = groupMemberRepository.findByGroupId(group.getId());
            long memberCount = allMembers.size();

            long pendingCount = GroupRole.LEADER.name().equals(myRole)
                    ? applicationRepository.countByGroupIdAndStatus(group.getId(), ApplicationStatus.PENDING)
                    : 0L;

            List<GroupMemberSummaryResponse> memberResponses = allMembers.stream()
                    .map(this::mapToMemberSummaryResponse)
                    .collect(Collectors.toList());

            return MyGroupSummaryResponse.builder()
                    .id(group.getId())
                    .title(group.getTitle())
                    .description(group.getDescription())
                    .courseCode(group.getCourseCode())
                    .courseName(group.getCourseName())
                    .college(group.getCollege())
                    .department(group.getDepartment())
                    .status(group.getStatus())
                    .maxMembers(group.getMaxMembers())
                    .memberCount(memberCount)
                    .myRole(myRole)
                    .leader(mapToUserSummary(group.getLeader()))
                    .members(memberResponses)
                    .pendingApplicationCount(pendingCount)
                    .createdAt(group.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    private GroupDetailResponse mapToDetailResponse(StudyGroup group) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        List<GroupMemberSummaryResponse> memberSummaries = members.stream()
                .map(this::mapToMemberSummaryResponse)
                .collect(Collectors.toList());

        return GroupDetailResponse.builder()
                .id(group.getId())
                .title(group.getTitle())
                .description(group.getDescription())
                .college(group.getCollege())
                .department(group.getDepartment())
                .postYear(group.getPostYear())
                .courseCode(group.getCourseCode())
                .courseName(group.getCourseName())
                .maxMembers(group.getMaxMembers())
                .memberCount((long) members.size())
                .status(group.getStatus())
                .leader(mapToUserSummary(group.getLeader()))
                .members(memberSummaries)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private GroupMemberSummaryResponse mapToMemberSummaryResponse(GroupMember member) {
        User u = member.getUser();
        return GroupMemberSummaryResponse.builder()
                .userId(u.getId())
                .studentId(StudentIdPrivacy.visibleStudentId(u.getStudentId()))
                .name(u.getName())
                .department(u.getDepartment())
                .faculty(u.getFaculty())
                .avatarUrl(u.getAvatarUrl())
                .role(member.getRole().name())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    private AuthResponse.UserSummary mapToUserSummary(User user) {
        if (user == null) return null;
        return AuthResponse.UserSummary.builder()
                .id(user.getId())
                .studentId(StudentIdPrivacy.visibleStudentId(user.getStudentId()))
                .name(user.getName())
                .department(user.getDepartment())
                .faculty(user.getFaculty())
                .email(StudentIdPrivacy.visibleEmail(user.getEmail(), user.getStudentId()))
                .academicYear(user.getAcademicYear())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }
}


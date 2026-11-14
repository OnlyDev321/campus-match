package com.campusmatch.service;

import com.campusmatch.dto.ApplicationResponse;
import com.campusmatch.dto.ApplyRequest;
import com.campusmatch.dto.AuthResponse;
import com.campusmatch.entity.*;
import com.campusmatch.security.StudentIdPrivacy;
import com.campusmatch.repository.ApplicationRepository;
import com.campusmatch.repository.GroupMemberRepository;
import com.campusmatch.repository.GroupRepository;
import com.campusmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Sinh viên nộp đơn xin gia nhập nhóm
     * POST /api/groups/{id}/applications
     */
    @Transactional
    public ApplicationResponse applyToGroup(Long groupId, ApplyRequest request, String studentId) {
        log.info("Sinh viên MSSV: {} nộp đơn vào nhóm ID: {}", studentId, groupId);

        User applicant = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm với ID: " + groupId));

        // 1. Kiểm tra trạng thái tuyển của nhóm
        if (group.getStatus() != GroupStatus.RECRUITING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nhóm hiện không còn tiếp nhận đơn ứng tuyển");
        }

        // 2. Không cho Leader tự nộp đơn vào nhóm do mình lập ra
        if (group.getLeader().getId().equals(applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn là trưởng nhóm, không thể tự ứng tuyển vào nhóm của mình");
        }

        // 3. Không cho nộp nếu đã là thành viên chính thức
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã là thành viên chính thức của nhóm này");
        }

        String desiredRole = StringUtils.hasText(request.getDesiredRole()) ? request.getDesiredRole().trim() : null;
        if (!group.getRolesQuota().isEmpty() && group.getRolesQuota().stream()
                .noneMatch(role -> role.getRole().equals(desiredRole) && role.getCurrent() < role.getMax())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vị trí ứng tuyển không hợp lệ hoặc đã đủ chỉ tiêu");
        }

        // 4. Kiểm tra đơn đã từng nộp trước đó
        Optional<Application> existingAppOpt = applicationRepository.findByGroupIdAndApplicantId(groupId, applicant.getId());
        if (existingAppOpt.isPresent()) {
            Application existing = existingAppOpt.get();
            if (existing.getStatus() == ApplicationStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã nộp đơn vào nhóm này và đơn đang chờ duyệt");
            } else if (existing.getStatus() == ApplicationStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã được duyệt vào nhóm này trước đó");
            } else {
                // Đã từng bị REJECTED -> cho phép cập nhật lại lời nhắn và gửi lại đơn chờ duyệt
                log.info("Đơn cũ của sinh viên {} bị REJECTED. Cập nhật lại trạng thái thành PENDING.", studentId);
                existing.setStatement(request.getStatement().trim());
                existing.setDesiredRole(desiredRole);
                existing.setStatus(ApplicationStatus.PENDING);
                existing.setUpdatedAt(LocalDateTime.now());
                Application updated = applicationRepository.save(existing);
                return mapToResponse(updated);
            }
        }

        // 5. Tạo mới đơn ứng tuyển
        Application application = Application.builder()
                .group(group)
                .applicant(applicant)
                .statement(request.getStatement().trim())
                .desiredRole(desiredRole)
                .status(ApplicationStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);
        log.info("Đã gửi đơn ứng tuyển thành công. Mã đơn: {}", saved.getId());

        // Gửi thông báo cho Leader nhóm
        notificationService.createNotification(
                group.getLeader(),
                applicant,
                NotificationType.APPLICATION_RECEIVED,
                "Đơn ứng tuyển mới",
                applicant.getName() + " vừa nộp đơn ứng tuyển vào nhóm '" + group.getTitle() + "'.",
                "/manage/" + group.getId(),
                group
        );

        return mapToResponse(saved);
    }

    /**
     * Xem tất cả đơn ứng tuyển của một nhóm (Chỉ Leader nhóm mới có quyền xem)
     * GET /api/groups/{id}/applications
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getGroupApplications(Long groupId, String studentId) {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm với ID: " + groupId));

        // Kiểm tra quyền: Chỉ Leader nhóm được xem
        if (!group.getLeader().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ trưởng nhóm mới có quyền xem danh sách đơn ứng tuyển");
        }

        List<Application> applications = applicationRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Trả về đơn của chính sinh viên để UI giữ trạng thái đã nộp sau khi tải lại. */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(String studentId) {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));
        return applicationRepository.findByApplicantId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Trưởng nhóm chấp thuận đơn ứng tuyển
     * PUT /api/applications/{id}/accept
     */
    @Transactional
    public ApplicationResponse acceptApplication(Long applicationId, String studentId) {
        log.info("Trưởng nhóm MSSV: {} chấp thuận đơn ID: {}", studentId, applicationId);

        User leader = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        StudyGroup group = application.getGroup();

        // 1. Kiểm tra quyền Leader
        if (!group.getLeader().getId().equals(leader.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ trưởng nhóm mới có quyền chấp thuận đơn ứng tuyển");
        }

        // 2. Nếu đơn đã ACCEPTED trước đó thì trả về luôn
        if (application.getStatus() == ApplicationStatus.ACCEPTED) {
            return mapToResponse(application);
        }
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể duyệt đơn đang chờ xử lý");
        }

        // 3. Kiểm tra sĩ số nhóm
        long currentMembers = groupMemberRepository.countByGroupId(group.getId());
        if (currentMembers >= group.getMaxMembers()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nhóm đã đủ số lượng thành viên tối đa (" + group.getMaxMembers() + ")");
        }

        GroupRoleQuota requestedRole = group.getRolesQuota().stream()
                .filter(role -> role.getRole().equals(application.getDesiredRole()))
                .findFirst().orElse(null);
        if (requestedRole != null && requestedRole.getCurrent() >= requestedRole.getMax()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vị trí ứng tuyển đã đủ chỉ tiêu");
        }

        // 4. Thêm ứng viên vào bảng group_members
        User applicant = application.getApplicant();
        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), applicant.getId())) {
            GroupMember newMember = GroupMember.builder()
                    .id(new GroupMemberId(group.getId(), applicant.getId()))
                    .group(group)
                    .user(applicant)
                    .role(GroupRole.MEMBER)
                    .joinedAt(LocalDateTime.now())
                    .build();
            groupMemberRepository.save(newMember);
            if (requestedRole != null) {
                requestedRole.setCurrent(requestedRole.getCurrent() + 1);
                group.setRolesQuota(new java.util.ArrayList<>(group.getRolesQuota()));
                groupRepository.save(group);
            }
            currentMembers++;
            log.info("Đã bổ sung sinh viên {} vào danh sách thành viên nhóm {}", applicant.getStudentId(), group.getId());
        }

        // 5. Cập nhật trạng thái đơn thành ACCEPTED
        application.setStatus(ApplicationStatus.ACCEPTED);
        application.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(application);

        // 6. Nếu sau khi thêm nhóm đã đủ người -> tự động đổi trạng thái nhóm thành COMPLETED
        if (currentMembers >= group.getMaxMembers()) {
            log.info("Nhóm ID: {} đã đủ số lượng ({}). Tự động cập nhật trạng thái nhóm sang COMPLETED.", group.getId(), currentMembers);
            group.setStatus(GroupStatus.COMPLETED);
            groupRepository.save(group);

            // Thông báo cho Leader nhóm đã đủ thành viên
            notificationService.createNotification(
                    leader,
                    null,
                    NotificationType.GROUP_FULL,
                    "Nhóm đã đủ sĩ số",
                    "Nhóm '" + group.getTitle() + "' đã đạt sĩ số tối đa (" + currentMembers + "/" + group.getMaxMembers() + ").",
                    "/manage/" + group.getId(),
                    group
            );
        }

        // 7. Gửi thông báo cho Ứng viên được duyệt
        notificationService.createNotification(
                applicant,
                leader,
                NotificationType.APPLICATION_ACCEPTED,
                "Đơn ứng tuyển được chấp thuận",
                "Chúc mừng! Đơn ứng tuyển của bạn vào nhóm '" + group.getTitle() + "' đã được chấp thuận.",
                "/groups/" + group.getId(),
                group
        );

        return mapToResponse(saved);
    }

    /**
     * Trưởng nhóm từ chối đơn ứng tuyển
     * PUT /api/applications/{id}/reject
     */
    @Transactional
    public ApplicationResponse rejectApplication(Long applicationId, String studentId) {
        log.info("Trưởng nhóm MSSV: {} từ chối đơn ID: {}", studentId, applicationId);

        User leader = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        StudyGroup group = application.getGroup();

        // Kiểm tra quyền Leader
        if (!group.getLeader().getId().equals(leader.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ trưởng nhóm mới có quyền từ chối đơn ứng tuyển");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể từ chối đơn đang chờ xử lý");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(application);

        // Gửi thông báo từ chối cho Ứng viên
        notificationService.createNotification(
                application.getApplicant(),
                leader,
                NotificationType.APPLICATION_REJECTED,
                "Đơn ứng tuyển chưa được chấp thuận",
                "Rất tiếc, đơn ứng tuyển của bạn vào nhóm '" + group.getTitle() + "' chưa phù hợp lần này.",
                "/groups",
                group
        );

        return mapToResponse(saved);
    }

    /**
     * Ứng viên tự rút đơn đang chờ duyệt
     * DELETE /api/applications/{id}
     */
    @Transactional
    public void withdrawApplication(Long applicationId, String studentId) {
        log.info("Sinh viên MSSV: {} rút đơn ID: {}", studentId, applicationId);

        User applicant = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ sinh viên"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        // Kiểm tra quyền: Chỉ chính ứng viên mới được rút đơn của mình
        if (!application.getApplicant().getId().equals(applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thể rút đơn ứng tuyển của người khác");
        }

        // Chỉ cho phép rút khi đơn đang ở trạng thái PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể rút đơn khi đang ở trạng thái chờ duyệt (PENDING)");
        }

        applicationRepository.delete(application);
        log.info("Đã xóa đơn ứng tuyển ID: {}", applicationId);
    }

    private ApplicationResponse mapToResponse(Application app) {
        User u = app.getApplicant();
        AuthResponse.UserSummary userSummary = AuthResponse.UserSummary.builder()
                .id(u.getId())
                .studentId(StudentIdPrivacy.visibleStudentId(u.getStudentId()))
                .name(u.getName())
                .department(u.getDepartment())
                .faculty(u.getFaculty())
                .email(StudentIdPrivacy.visibleEmail(u.getEmail(), u.getStudentId()))
                .academicYear(u.getAcademicYear())
                .phoneNumber(u.getPhoneNumber())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole())
                .build();

        return ApplicationResponse.builder()
                .id(app.getId())
                .groupId(app.getGroup().getId())
                .applicant(userSummary)
                .statement(app.getStatement())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}


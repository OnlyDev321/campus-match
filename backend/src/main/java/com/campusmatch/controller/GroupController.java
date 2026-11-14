package com.campusmatch.controller;

import com.campusmatch.dto.CreateGroupRequest;
import com.campusmatch.dto.GroupDetailResponse;
import com.campusmatch.dto.GroupSummaryResponse;
import com.campusmatch.dto.UpdateGroupRequest;
import com.campusmatch.entity.GroupStatus;
import com.campusmatch.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /**
     * Lấy danh sách các năm có nhóm tồn tại (Cho Year filter dropdown, Công khai)
     * GET /api/groups/years → [2026, 2025, 2024]
     */
    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        List<Integer> years = groupService.getAvailableYears();
        return ResponseEntity.ok(years);
    }

    /**
     * Tìm kiếm và lọc danh sách nhóm học tập (Công khai)
     * GET /api/groups
     */
    @GetMapping
    public ResponseEntity<Page<GroupSummaryResponse>> getGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer postYear,
            @RequestParam(required = false) GroupStatus status,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<GroupSummaryResponse> page = groupService.getGroups(
                keyword, college, department, postYear, status, pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * Xem chi tiết nhóm kèm danh sách thành viên (Công khai)
     * GET /api/groups/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GroupDetailResponse> getGroupDetail(@PathVariable Long id) {
        GroupDetailResponse response = groupService.getGroupDetail(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo một nhóm học tập mới (Yêu cầu JWT Bearer Token, người tạo là Leader)
     * POST /api/groups
     */
    @PostMapping
    public ResponseEntity<GroupDetailResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tạo nhóm");
        }

        String studentId = authentication.getName();
        GroupDetailResponse response = groupService.createGroup(request, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Cập nhật thông tin nhóm; trạng thái tuyển được tính từ sĩ số. */
    @PutMapping("/{id}")
    public ResponseEntity<GroupDetailResponse> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để cập nhật nhóm");
        }
        return ResponseEntity.ok(groupService.updateGroup(id, request, authentication.getName()));
    }

    /**
     * Xóa nhóm học tập (Yêu cầu JWT Bearer Token, chỉ Leader mới có quyền)
     * DELETE /api/groups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện thao tác");
        }

        String studentId = authentication.getName();
        groupService.deleteGroup(id, studentId);
        return ResponseEntity.noContent().build();
    }
}


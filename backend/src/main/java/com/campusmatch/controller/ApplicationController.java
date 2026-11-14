package com.campusmatch.controller;

import com.campusmatch.dto.ApplicationResponse;
import com.campusmatch.dto.ApplyRequest;
import com.campusmatch.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Sinh viên nộp đơn xin gia nhập nhóm
     * POST /api/groups/{groupId}/applications
     */
    @PostMapping("/groups/{groupId}/applications")
    public ResponseEntity<ApplicationResponse> applyToGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody ApplyRequest request,
            Authentication authentication) {

        String studentId = getAuthenticatedStudentId(authentication);
        ApplicationResponse response = applicationService.applyToGroup(groupId, request, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Leader xem toàn bộ đơn ứng tuyển của một nhóm
     * GET /api/groups/{groupId}/applications
     */
    @GetMapping("/groups/{groupId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getGroupApplications(
            @PathVariable Long groupId,
            Authentication authentication) {

        String studentId = getAuthenticatedStudentId(authentication);
        List<ApplicationResponse> responses = applicationService.getGroupApplications(groupId, studentId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/users/me/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getMyApplications(getAuthenticatedStudentId(authentication)));
    }

    /**
     * Leader duyệt chấp thuận một đơn ứng tuyển
     * PUT /api/applications/{id}/accept
     */
    @PutMapping("/applications/{id}/accept")
    public ResponseEntity<ApplicationResponse> acceptApplication(
            @PathVariable Long id,
            Authentication authentication) {

        String studentId = getAuthenticatedStudentId(authentication);
        ApplicationResponse response = applicationService.acceptApplication(id, studentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Leader từ chối một đơn ứng tuyển
     * PUT /api/applications/{id}/reject
     */
    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<ApplicationResponse> rejectApplication(
            @PathVariable Long id,
            Authentication authentication) {

        String studentId = getAuthenticatedStudentId(authentication);
        ApplicationResponse response = applicationService.rejectApplication(id, studentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Ứng viên tự rút đơn đang chờ duyệt
     * DELETE /api/applications/{id}
     */
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long id,
            Authentication authentication) {

        String studentId = getAuthenticatedStudentId(authentication);
        applicationService.withdrawApplication(id, studentId);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedStudentId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện hành động này");
        }
        return authentication.getName();
    }
}


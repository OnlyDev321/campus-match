package com.campusmatch.security;

import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Quy tắc hiển thị MSSV trong response: chỉ chủ tài khoản được xem đầy đủ. */
public final class StudentIdPrivacy {
    private StudentIdPrivacy() {}

    private static boolean isOwner(String studentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return studentId != null && !studentId.isBlank()
                && authentication != null && authentication.isAuthenticated()
                && !new AuthenticationTrustResolverImpl().isAnonymous(authentication)
                && studentId.equals(authentication.getName());
    }

    public static String visibleStudentId(String studentId) {
        if (studentId == null || isOwner(studentId)) return studentId;
        return publicStudentId(studentId);
    }

    /** Response nhóm luôn che bốn ký tự đầu, kể cả khi người xem là chủ tài khoản. */
    public static String publicStudentId(String studentId) {
        if (studentId == null) return null;
        int hiddenLength = Math.min(4, studentId.length());
        return "*".repeat(hiddenLength) + studentId.substring(hiddenLength);
    }

    /** Không trả email chứa MSSV đầy đủ của người khác, kể cả trong liên kết mailto. */
    public static String visibleEmail(String email, String studentId) {
        if (email != null && studentId != null && !studentId.isBlank()
                && email.contains(studentId) && !isOwner(studentId)) return null;
        return email;
    }
}

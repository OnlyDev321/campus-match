package com.campusmatch.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;

class StudentIdPrivacyTest {
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void anonymousViewKeepsOnlyLastFourDigits() {
        assertEquals("****0020", StudentIdPrivacy.visibleStudentId("20260020"));
        assertNull(StudentIdPrivacy.visibleEmail("20260020@soongsil.ac.kr", "20260020"));
        assertNull(StudentIdPrivacy.visibleStudentId(null));
    }

    @Test
    void ownerSeesOwnFullIdAndEmail() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("20260020", null, AuthorityUtils.NO_AUTHORITIES));
        assertEquals("20260020", StudentIdPrivacy.visibleStudentId("20260020"));
        assertEquals("20260020@soongsil.ac.kr", StudentIdPrivacy.visibleEmail("20260020@soongsil.ac.kr", "20260020"));
        assertEquals("****0021", StudentIdPrivacy.visibleStudentId("20260021"));
    }

    @Test
    void leaderOrAdminCannotSeeAnotherPersonsIdEvenWithSameSuffix() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("20250020", null,
                        AuthorityUtils.createAuthorityList("ROLE_ADMIN", "ROLE_LEADER")));
        assertEquals("****0020", StudentIdPrivacy.visibleStudentId("20260020"));
        assertNull(StudentIdPrivacy.visibleEmail("20260020@soongsil.ac.kr", "20260020"));
        assertEquals("park@soongsil.ac.kr", StudentIdPrivacy.visibleEmail("park@soongsil.ac.kr", "20260020"));
    }

    @Test
    void unauthenticatedPrincipalCannotClaimOwnership() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.unauthenticated("20260020", null));
        assertEquals("****0020", StudentIdPrivacy.visibleStudentId("20260020"));
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken(
                "key", "20260020", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")));
        assertEquals("****0020", StudentIdPrivacy.visibleStudentId("20260020"));
    }
}

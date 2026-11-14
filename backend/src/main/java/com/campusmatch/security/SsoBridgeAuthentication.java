package com.campusmatch.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;

/**
 * Authentication of the Next.js BFF acting on behalf of one verified student. It only exists for the
 * duration of a single {@code POST /api/auth/sso/usaint} request and is never a student session: it
 * carries {@code ROLE_SSO_BRIDGE}, which no application JWT can grant.
 */
public final class SsoBridgeAuthentication extends AbstractAuthenticationToken {

    public static final String ROLE = "SSO_BRIDGE";

    private final VerifiedSsoIdentity identity;

    public SsoBridgeAuthentication(VerifiedSsoIdentity identity) {
        super(AuthorityUtils.createAuthorityList("ROLE_" + ROLE));
        this.identity = identity;
        setAuthenticated(true);
    }

    public VerifiedSsoIdentity identity() {
        return identity;
    }

    @Override
    public Object getPrincipal() {
        return identity;
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    /** Deliberately not the student ID, so this authentication can never look like a student's own. */
    @Override
    public String getName() {
        return "sso-bridge";
    }
}

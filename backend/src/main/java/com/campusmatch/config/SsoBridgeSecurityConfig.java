package com.campusmatch.config;

import com.campusmatch.security.SsoAssertionAuthenticationFilter;
import com.campusmatch.security.SsoAssertionReplayGuard;
import com.campusmatch.security.SsoAssertionVerifier;
import com.campusmatch.security.SsoBridgeAuthentication;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Dedicated filter chain for the one endpoint the Next.js BFF calls to turn a verified u-SAINT login into an
 * application JWT. It is isolated from the student chain in {@link SecurityConfig}:
 * <ul>
 *   <li>the only credential it accepts is a signed BFF assertion (application JWTs are not even parsed here);</li>
 *   <li>no CORS configuration, so a browser can neither preflight nor read a cross-origin call to it;</li>
 *   <li>no CSRF/session: the request carries no ambient credential, only the per-request signed header.</li>
 * </ul>
 */
@Configuration
public class SsoBridgeSecurityConfig {

    public static final String SSO_LOGIN_PATH = "/api/auth/sso/usaint";

    @Bean
    @Order(1)
    public SecurityFilterChain ssoBridgeFilterChain(
            HttpSecurity http,
            SsoAssertionVerifier verifier,
            SsoAssertionReplayGuard replayGuard) throws Exception {
        http
                .securityMatcher(SSO_LOGIN_PATH)
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(
                        (request, response, exception) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth.anyRequest().hasRole(SsoBridgeAuthentication.ROLE))
                .addFilterBefore(new SsoAssertionAuthenticationFilter(verifier, replayGuard),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

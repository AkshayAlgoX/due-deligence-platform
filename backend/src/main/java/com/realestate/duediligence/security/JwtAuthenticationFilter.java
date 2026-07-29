package com.realestate.duediligence.security;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.impl.CustomUserDetailsService;
import com.realestate.duediligence.util.JwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * JWT authentication filter.
 *
 * Extracts and validates the Bearer token on every request. If the token is
 * malformed, expired, or signed incorrectly, returns a clean 401 JSON
 * response (instead of letting Spring bubble it to a generic 500).
 *
 * Also enforces "Logout of all devices" — tokens issued before a user's
 * tokenValidFrom timestamp are rejected as if expired.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No Bearer token — let request continue (public endpoints handle it)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String email = jwtService.extractUsername(jwt);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {

                    // ── "Logout of all devices" check ──────────────────────
                    // Reject tokens issued before the user's tokenValidFrom.
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent() && userOpt.get().getTokenValidFrom() != null) {
                        LocalDateTime validFrom = userOpt.get().getTokenValidFrom();
                        Date issuedAt = jwtService.extractIssuedAt(jwt);
                        Instant issuedAtInstant = issuedAt.toInstant();
                        Instant validFromInstant =
                                validFrom.atZone(ZoneId.systemDefault()).toInstant();

                        if (issuedAtInstant.isBefore(validFromInstant)) {
                            writeError(response, HttpStatus.UNAUTHORIZED,
                                    "SESSION_INVALIDATED",
                                    "Your session was ended. Please log in again.");
                            return;
                        }
                    }
                    // ────────────────────────────────────────────────────────

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException ex) {
            writeError(response, HttpStatus.UNAUTHORIZED,
                    "TOKEN_EXPIRED",
                    "Your session has expired. Please log in again.");
        } catch (MalformedJwtException | UnsupportedJwtException | SignatureException ex) {
            writeError(response, HttpStatus.UNAUTHORIZED,
                    "TOKEN_INVALID",
                    "Authentication token is invalid.");
        } catch (Exception ex) {
            // Defensive: any other JWT parsing issue → still 401, not 500
            writeError(response, HttpStatus.UNAUTHORIZED,
                    "TOKEN_ERROR",
                    "Authentication failed.");
        }
    }

    /**
     * Write a clean JSON error response manually (no ObjectMapper dependency).
     * Shape matches what the frontend expects from api.js.
     */
    private void writeError(HttpServletResponse response,
                            HttpStatus status,
                            String code,
                            String message) throws IOException {

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                LocalDateTime.now().toString(),
                status.value(),
                escape(code),
                escape(message)
        );

        response.getWriter().write(json);
    }

    /** Minimal JSON string escaping — safe for our controlled inputs. */
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
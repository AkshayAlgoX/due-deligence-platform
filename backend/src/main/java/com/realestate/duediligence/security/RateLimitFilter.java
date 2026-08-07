package com.realestate.duediligence.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate-limit filter for authentication endpoints.
 *
 * Runs BEFORE Spring Security to reject over-limit requests early
 * (saves CPU on password hashing, DB lookups, etc.).
 *
 * On limit exceeded:
 *   - HTTP 429 Too Many Requests
 *   - Retry-After header (seconds until refill)
 *   - JSON body compatible with frontend ApiResponse
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        String endpoint = classify(path);
        if (endpoint == null) {
            chain.doFilter(request, response);
            return;
        }

        // Auth rate limiting only applies to POSTs
        if (!"export".equals(endpoint) && !"POST".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = extractIp(request);

        boolean allowed = switch (endpoint) {
            case "login" -> rateLimitService.tryLogin(ip);
            case "forgot" -> rateLimitService.tryForgotPassword(ip);
            case "register" -> rateLimitService.tryRegister(ip);
            case "otp" -> rateLimitService.tryOtpVerify(ip);
            case "export" -> rateLimitService.tryExport(ip);
            default -> true;
        };

        if (!allowed) {
            long retryAfter = rateLimitService.secondsUntilRefill(endpoint, ip);
            log.warn("Rate limit exceeded for {} on {} from {}", endpoint, path, ip);
            writeRateLimitResponse(response, retryAfter);
            return;
        }

        chain.doFilter(request, response);
    }

    // ── Endpoint classifier ───────────────────────────────────────

       private String classify(String path) {
        if (path.startsWith("/api/export")) return "export";

        if (path.equals("/api/auth/login")) return "login";
        if (path.equals("/api/auth/google")) return "login";

        // Registration OTP flow — all 3 endpoints share the "register" bucket
        if (path.equals("/api/auth/register/send-otp"))   return "register";
        if (path.equals("/api/auth/register/verify-otp")) return "otp";
        if (path.equals("/api/auth/register/resend-otp")) return "register";

        // Password reset flow
        if (path.equals("/api/auth/forgot-password")) return "forgot";
        if (path.equals("/api/auth/verify-otp"))      return "otp";
        if (path.equals("/api/auth/reset-password"))  return "otp";

        return null;
    }

    // ── IP extraction (proxy-aware) ───────────────────────────────

    private String extractIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        String remote = request.getRemoteAddr();
        return "0:0:0:0:0:0:0:1".equals(remote) ? "127.0.0.1" : remote;
    }

    // ── 429 response ──────────────────────────────────────────────

    private void writeRateLimitResponse(HttpServletResponse response, long retryAfterSec) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(retryAfterSec));

        String humanTime = formatDuration(retryAfterSec);
        String message = "Too many attempts. Please try again in " + humanTime + ".";

        // Manual JSON — no Jackson dependency needed
        String body = String.format(
                "{\"success\":false,\"message\":\"%s\",\"status\":429}",
                message.replace("\"", "\\\"")
        );

        response.getWriter().write(body);
        response.getWriter().flush();
    }

    private String formatDuration(long seconds) {
        if (seconds < 60) return seconds + " second" + (seconds == 1 ? "" : "s");
        long mins = seconds / 60;
        if (mins < 60) return mins + " minute" + (mins == 1 ? "" : "s");
        long hrs = mins / 60;
        return hrs + " hour" + (hrs == 1 ? "" : "s");
    }
}
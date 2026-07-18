package com.realestate.duediligence.service;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Email service for transactional emails.
 * All sends are @Async — non-blocking, runs on background thread.
 *
 * Templates:
 *   • sendPasswordResetOtp   → OTP for password reset
 *   • sendWelcomeEmail       → Welcome new users after registration
 *   • sendLoginAlert         → Notify user of new login (security)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name}")
    private String fromName;

    // ══════════════════════════════════════════════════════════════
    //  1. PASSWORD RESET OTP
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp, String userName) {
        sendEmail(
                toEmail,
                "🔐 Your password reset code: " + otp,
                buildResetEmailHtml(otp, userName),
                "password reset"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  2. WELCOME EMAIL
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        sendEmail(
                toEmail,
                "🎉 Welcome to Real Estate Due Diligence!",
                buildWelcomeEmailHtml(userName),
                "welcome"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  3. LOGIN ALERT
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendLoginAlert(String toEmail, String userName, String ipAddress, String userAgent) {
        sendEmail(
                toEmail,
                "🔔 New login to your account",
                buildLoginAlertHtml(userName, ipAddress, userAgent),
                "login alert"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  CORE SENDER (reusable)
    // ══════════════════════════════════════════════════════════════

    private void sendEmail(String toEmail, String subject, String htmlBody, String label) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("✉️  {} email sent to {}", label, toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("❌ Failed to send {} email to {}: {}", label, toEmail, e.getMessage());
            // Don't throw — email failures shouldn't break the main flow
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  EMAIL TEMPLATES
    // ══════════════════════════════════════════════════════════════

    private String buildResetEmailHtml(String otp, String userName) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        return emailWrapper("Password Reset", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Hi %s 👋
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your account. Use the verification code below to continue:
            </p>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border: 2px dashed #22C55E; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    Your verification code
                </p>
                <p style="margin: 0; color: #111827; font-size: 42px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                    %s
                </p>
                <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">
                    ⏱️ Expires in 10 minutes
                </p>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <strong style="color: #374151;">Didn't request this?</strong><br>
                You can safely ignore this email — your password won't be changed.
            </p>
            """.formatted(displayName, otp));
    }

    private String buildWelcomeEmailHtml(String userName) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        return emailWrapper("Welcome!", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 26px; font-weight: 800;">
                Welcome aboard, %s! 🎉
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Thanks for joining <strong>Real Estate Due Diligence Agent</strong>! We're thrilled to have you on the platform.
            </p>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #16a34a; font-size: 16px; font-weight: 700;">
                    🚀 What you can do now:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    <li><strong>Search properties</strong> across cities</li>
                    <li><strong>Run due diligence</strong> reports instantly</li>
                    <li><strong>Assess risks</strong> with AI-powered insights</li>
                    <li><strong>Compare properties</strong> side-by-side</li>
                    <li><strong>Track ownership</strong> history & tax records</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:3000/dashboard"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22C55E 0%%, #16a34a 100%%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 30px rgba(34,197,94,0.3);">
                    Open Dashboard →
                </a>
            </div>

            <div style="margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #22C55E;">
                <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.6;">
                    <strong>💡 Pro Tip:</strong><br>
                    Start by exploring the property search — try searching your own city to see live data!
                </p>
            </div>

            <p style="margin: 32px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Questions? Just reply to this email or contact our support team.
            </p>
            """.formatted(displayName));
    }

    private String buildLoginAlertHtml(String userName, String ipAddress, String userAgent) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        String timestamp = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a"));
        String safeIp = (ipAddress != null) ? ipAddress : "Unknown";
        String safeAgent = (userAgent != null) ? shortenUserAgent(userAgent) : "Unknown device";

        return emailWrapper("New Login", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Hi %s 🔔
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We noticed a new sign-in to your Real Estate Due Diligence account. Here are the details:
            </p>

            <table style="width: 100%%; border-collapse: collapse; background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
                <tr>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        📅 Time
                    </td>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600;">
                        %s
                    </td>
                </tr>
                <tr>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        🌐 IP Address
                    </td>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600; font-family: 'Courier New', monospace;">
                        %s
                    </td>
                </tr>
                <tr>
                    <td style="padding: 14px 20px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        💻 Device
                    </td>
                    <td style="padding: 14px 20px; font-size: 14px; color: #111827; font-weight: 600;">
                        %s
                    </td>
                </tr>
            </table>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                    <strong>⚠️ Was this you?</strong><br>
                    If yes, no action needed. If you don't recognize this activity, please <strong>reset your password immediately</strong>.
                </p>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                We send these alerts to help keep your account secure. Stay safe out there! 🛡️
            </p>
            """.formatted(displayName, timestamp, safeIp, safeAgent));
    }

    /**
     * Shared email wrapper with header/footer.
     */
    private String emailWrapper(String previewText, String bodyContent) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #22C55E 0%%, #16a34a 100%%); padding: 40px 30px; text-align: center;">
                            <div style="display: inline-block; width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 64px; margin-bottom: 16px;">
                                <span style="font-size: 32px;">🛡️</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                                Real Estate Due Diligence
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">
                                Secure Property Intelligence
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            %s
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600;">
                                Real Estate Due Diligence Agent
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                © 2026 · All rights reserved
                            </p>
                            <p style="margin: 12px 0 0; color: #9ca3af; font-size: 10px;">
                                This is an automated message. Please do not reply directly.
                            </p>
                        </td>
                    </tr>

                </table>

            </body>
            </html>
            """.formatted(previewText, bodyContent);
    }

    /**
     * Shorten user agent string to friendly device name.
     * e.g., "Mozilla/5.0 ..." → "Chrome on Windows"
     */
    private String shortenUserAgent(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();

        String browser = "Browser";
        if (ua.contains("edg")) browser = "Edge";
        else if (ua.contains("chrome")) browser = "Chrome";
        else if (ua.contains("firefox")) browser = "Firefox";
        else if (ua.contains("safari")) browser = "Safari";

        String os = "Device";
        if (ua.contains("windows")) os = "Windows";
        else if (ua.contains("mac")) os = "Mac";
        else if (ua.contains("linux")) os = "Linux";
        else if (ua.contains("android")) os = "Android";
        else if (ua.contains("iphone") || ua.contains("ipad")) os = "iOS";

        return browser + " on " + os;
    }
}
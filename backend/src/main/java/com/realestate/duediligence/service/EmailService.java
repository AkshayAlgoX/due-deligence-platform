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
 *   • sendPasswordResetOtp        → OTP for password reset
 *   • sendWelcomeEmail            → Welcome new users after registration
 *   • sendLoginAlert              → Notify user of new login (security)
 *   • sendAccountDeletionEmail    → Confirm account deletion (GDPR)
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
                "Your password reset code: " + otp,
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
                "Welcome to Real Estate Due Diligence",
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
                "New login to your account",
                buildLoginAlertHtml(userName, ipAddress, userAgent),
                "login alert"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  4. ACCOUNT DELETION (NEW)
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendAccountDeletionEmail(String toEmail, String userName) {
        sendEmail(
                toEmail,
                "Your account has been deleted",
                buildDeletionEmailHtml(userName, toEmail),
                "account deletion"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  5. REPORT READY NOTIFICATION
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendReportReadyEmail(String toEmail, String userName,
                                     String reportTitle, String propertyAddress, Long reportId) {
        sendEmail(
                toEmail,
                "Your due diligence report is ready",
                buildReportReadyHtml(userName, reportTitle, propertyAddress, reportId),
                "report ready"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  6. RISK ALERT NOTIFICATION
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendRiskAlertEmail(String toEmail, String userName,
                                   String propertyAddress, String riskLevel, Long propertyId) {
        sendEmail(
                toEmail,
                "Risk alert for your property",
                buildRiskAlertHtml(userName, propertyAddress, riskLevel, propertyId),
                "risk alert"
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  8. CONTACT FORM NOTIFICATION
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendContactNotification(com.realestate.duediligence.entity.ContactMessage msg) {
        sendEmail(
                fromAddress,
                "New contact form submission: " + msg.getTopic() + " — " + msg.getName(),
                buildContactNotificationHtml(msg),
                "contact notification"
        );
    }

    private String buildContactNotificationHtml(com.realestate.duediligence.entity.ContactMessage msg) {
        String safeName = (msg.getName() != null && !msg.getName().isBlank()) ? msg.getName() : "Unknown";
        String safeEmail = (msg.getEmail() != null) ? msg.getEmail() : "Unknown";
        String safeCompany = (msg.getCompany() != null && !msg.getCompany().isBlank()) ? msg.getCompany() : "—";
        String safeMessage = (msg.getMessage() != null) ? msg.getMessage() : "—";

        return emailWrapper("New Contact Submission", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 800;">
                New contact form submission
            </h2>
            <table style="width: 100%%; border-collapse: collapse; background: #f9fafb; border-radius: 12px; margin: 16px 0;">
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Name</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600;">%s</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600;">%s</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Company</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600;">%s</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Topic</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #16a34a; font-weight: 700; text-transform: uppercase;">%s</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Message</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; line-height: 1.6;">%s</td>
                </tr>
            </table>
            """.formatted(safeName, safeEmail, safeCompany,
                msg.getTopic() != null ? msg.getTopic().toUpperCase() : "GENERAL", safeMessage));
    }

    // ══════════════════════════════════════════════════════════════
    //  CORE SENDER (reusable)
    // ══════════════════════════════════════════════════════════════
        // ══════════════════════════════════════════════════════════════
    //  7. REGISTRATION OTP
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendRegistrationOtp(String toEmail, String otp, String userName) {
        sendEmail(
                toEmail,
                "Verify your email: " + otp,
                buildRegistrationEmailHtml(otp, userName),
                "registration OTP"
        );
    }

    public void sendEmail(String toEmail, String subject, String htmlBody, String label) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent — {} → {}", label, toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send {} email to {}: {}", label, toEmail, e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  EMAIL TEMPLATES
    // ══════════════════════════════════════════════════════════════
        private String buildRegistrationEmailHtml(String otp, String userName) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        return emailWrapper("Verify your email", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Welcome, %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                You're just one step away from creating your account. Enter the verification code below to confirm your email address:
            </p>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border: 2px dashed #22C55E; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    Your verification code
                </p>
                <p style="margin: 0; color: #111827; font-size: 42px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                    %s
                </p>
                <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">
                    Expires in 10 minutes
                </p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                    <strong>Never share this code.</strong><br>
                    Our team will never ask you for this code. If someone is asking, it's a scam.
                </p>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <strong style="color: #374151;">Didn't create an account?</strong><br>
                You can safely ignore this email — no account will be created without this code.
            </p>
            """.formatted(displayName, otp));
    }

    private String buildResetEmailHtml(String otp, String userName) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        return emailWrapper("Password Reset", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Hi %s
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
                    Expires in 10 minutes
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
                Welcome aboard, %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Thanks for joining <strong>Real Estate Due Diligence Agent</strong>. We're glad to have you.
            </p>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #16a34a; font-size: 16px; font-weight: 700;">
                    What you can do now:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    <li>Search properties across cities</li>
                    <li>Add and verify property listings</li>
                    <li>Track ownership history and tax records</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:3000/dashboard"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22C55E 0%%, #16a34a 100%%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 30px rgba(34,197,94,0.3);">
                    Open dashboard
                </a>
            </div>

            <p style="margin: 32px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Questions? Just reply to this email.
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
                Hi %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We noticed a new sign-in to your Real Estate Due Diligence account:
            </p>

            <table style="width: 100%%; border-collapse: collapse; background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
                <tr>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        Time
                    </td>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600;">
                        %s
                    </td>
                </tr>
                <tr>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        IP address
                    </td>
                    <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-weight: 600; font-family: 'Courier New', monospace;">
                        %s
                    </td>
                </tr>
                <tr>
                    <td style="padding: 14px 20px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        Device
                    </td>
                    <td style="padding: 14px 20px; font-size: 14px; color: #111827; font-weight: 600;">
                        %s
                    </td>
                </tr>
            </table>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                    <strong>Was this you?</strong><br>
                    If yes, no action needed. If not, please reset your password immediately.
                </p>
            </div>
            """.formatted(displayName, timestamp, safeIp, safeAgent));
    }

    private String buildDeletionEmailHtml(String userName, String email) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        return emailWrapper("Account Deleted", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Goodbye, %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                This confirms that your Real Estate Due Diligence Agent account
                (<strong>%s</strong>) has been permanently deleted, along with all
                associated properties and data.
            </p>

            <div style="background: #f9fafb; border-left: 4px solid #22C55E; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.6;">
                    <strong>What was deleted:</strong><br>
                    • Your profile and account credentials<br>
                    • All properties you created<br>
                    • Session data and reset tokens
                </p>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <strong style="color: #374151;">Didn't do this?</strong><br>
                If you didn't request this deletion, please contact us immediately at
                <a href="mailto:duedeligence8@gmail.com" style="color: #16a34a; font-weight: 600;">duedeligence8@gmail.com</a>
            </p>

            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px;">
                We're sorry to see you go. You're welcome back anytime.
            </p>
            """.formatted(displayName, email));
    }

    private String buildReportReadyHtml(String userName, String reportTitle,
                                        String propertyAddress, Long reportId) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        String reportUrl = "http://localhost:3000/reports/" + reportId;
        return emailWrapper("Report Ready", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Your report is ready, %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Your due diligence report has been generated successfully and is ready to view.
            </p>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border: 2px solid #22C55E; border-radius: 16px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    Report
                </p>
                <p style="margin: 0 0 4px; color: #111827; font-size: 18px; font-weight: 800;">
                    %s
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Property: %s
                </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="%s"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22C55E 0%%, #16a34a 100%%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 30px rgba(34,197,94,0.3);">
                    View Report
                </a>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                The report includes an executive summary, risk analysis across 6 categories, financial data, and actionable recommendations.
            </p>
            """.formatted(displayName, reportTitle, propertyAddress, reportUrl));
    }

    private String buildRiskAlertHtml(String userName, String propertyAddress,
                                       String riskLevel, Long propertyId) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : "there";
        String propertyUrl = "http://localhost:3000/dashboard/property-search/" + propertyId;
        String alertColor = riskLevel != null && riskLevel.equalsIgnoreCase("CRITICAL")
                ? "#dc2626" : "#f59e0b";
        return emailWrapper("Risk Alert", """
            <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 800;">
                Risk alert, %s
            </h2>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                A risk assessment update has been detected for one of your properties.
            </p>

            <div style="background: #fef3c7; border: 2px solid %s; border-radius: 16px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: %s; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    Risk Level: %s
                </p>
                <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700;">
                    %s
                </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="%s"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22C55E 0%%, #16a34a 100%%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 30px rgba(34,197,94,0.3);">
                    View Property
                </a>
            </div>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Review the full risk assessment to understand the factors contributing to this alert.
            </p>
            """.formatted(displayName, alertColor, alertColor, riskLevel, propertyAddress, propertyUrl));
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
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                                Real Estate Due Diligence
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">
                                Secure property intelligence
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
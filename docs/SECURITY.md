# Security Policy - Real Estate Due Diligence Agent

This document outlines the security measures, best practices, and incident response procedures for the Real Estate Due Diligence Agent platform.

---

## 📋 Table of Contents

- [Security Overview](#security-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Infrastructure Security](#infrastructure-security)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Security Checklist](#security-checklist)

---

## 🔒 Security Overview

### Core Principles

- **Defense in Depth** - Multiple layers of security controls
- **Least Privilege** - Users get minimum required access
- **Zero Trust** - Never trust, always verify
- **Privacy by Design** - Data protection built into the system

### Security Compliance

- GDPR compliant for EU users
- Data localization for Indian properties
- Industry standard encryption practices
- Regular security audits

---

## 🔐 Authentication & Authorization

### Authentication Methods

| Method           | Use Case           | Security Level |
| ---------------- | ------------------ | -------------- |
| JWT Token        | API authentication | High           |
| OAuth2 / Google  | Social login       | High           |
| OTP Verification | Password reset     | Medium         |
| Email + Password | Standard login     | High           |

### Password Requirements

```
- Minimum length: 8 characters
- Must include: Uppercase, lowercase, number, special character
- Maximum length: 64 characters
- No common passwords allowed
- No personal information (name, email, etc.)
```

### Session Management

- JWT tokens expire after **24 hours** (configurable)
- Refresh tokens valid for **7 days**
- Tokens are invalidated on logout
- Concurrent sessions limited to 3 per user
- Session timeout after **30 minutes** of inactivity

### Role-Based Access Control (RBAC)

| Role                      | Permissions                                        |
| ------------------------- | -------------------------------------------------- |
| **BUYER**                 | View properties, search, generate reports          |
| **AGENT**                 | Add/update properties, view all data               |
| **LEGAL_REVIEWER**        | Access due diligence data, legal documents         |
| **FINANCIAL_INSTITUTION** | Access financial data, tax records                 |
| **ADMIN**                 | Full access, user management, system configuration |

### Authorization Flow

```
1. User authenticates → Receives JWT token
2. Token includes user ID and role
3. Each request validates token signature
4. Role-based access checks at controller level
5. Additional data-level permissions enforced
```

---

## 🛡️ Data Protection

### Encryption Standards

#### At Rest

| Data Type        | Encryption Method    | Key Management            |
| ---------------- | -------------------- | ------------------------- |
| User passwords   | BCrypt (strength 10) | Application-level         |
| PII data         | AES-256              | AWS KMS / Azure Key Vault |
| Property records | AES-256              | Application-level         |
| API keys         | AES-256              | AWS KMS                   |
| Backup data      | AES-256              | Cloud provider            |

#### In Transit

```
- All communications use TLS 1.2+
- HTTPS enforced for all endpoints
- HSTS (HTTP Strict Transport Security) enabled
- Perfect Forward Secrecy (PFS) ciphers only
- Certificate rotation every 90 days
```

### PII Data Handling

**Collected Data:**

- Email address
- Phone number
- Full name
- Property addresses
- Financial information (market values)

**Protection Measures:**

- Data minimization - collect only what's needed
- Encryption in transit and at rest
- Access restricted to authorized personnel only
- Data retention policy: 7 years (regulatory requirement)
- Right to delete under GDPR/CCPA

### Database Security

```sql
-- Secure connection parameters
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.leak-detection-threshold=60000

-- Use SSL for database connections
spring.datasource.url=jdbc:postgresql://localhost:5432/db?useSSL=true&requireSSL=true
```

---

## 🌐 API Security

### Security Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting

```yaml
Default rate limits:
  - 100 requests per minute per IP
  - 500 requests per hour per user
  - 1000 requests per day per user

Admin endpoints:
  - 20 requests per minute per IP
  - Configurable per environment
```

### Input Validation

- All user inputs validated on server-side
- SQL injection prevention using JPA/Hibernate
- XSS protection - HTML sanitization
- CSRF protection with double-submit cookie pattern
- File upload restrictions:
  - Allowed types: JPG, PNG, WebP
  - Maximum size: 5 MB
  - Virus scanning enabled

### API Authentication Flow

```java
// JWT Validation Filter
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## 🏗️ Infrastructure Security

### Cloud Security (AWS/Azure)

- **Network Security:**
  - VPC with private subnets
  - Security groups with least privilege
  - WAF (Web Application Firewall) enabled
  - DDoS protection active

- **Access Control:**
  - IAM roles with minimal permissions
  - MFA required for all cloud console access
  - Access keys rotated every 90 days
  - Bastion host for SSH access

### Container Security (Docker)

```dockerfile
# Docker Security Best Practices
FROM openjdk:21-slim  # Use minimal base image
RUN useradd -m -u 1000 appuser
USER appuser
COPY --chown=appuser:appuser target/app.jar app.jar

# No root user in container
# Scan images for vulnerabilities
# Use trusted base images only
```

### Docker Compose Security

```yaml
version: "3.8"
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs: /tmp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Network Security

- **Firewall Rules:**
  - Ingress: Only ports 443 (HTTPS), 80 (HTTP redirect)
  - SSH: Port 22 restricted to jump server IPs
  - Database: Only accessible from application subnet
- **Monitoring:**
  - Network intrusion detection
  - Anomaly detection enabled
  - VPC flow logs enabled
  - GuardDuty (AWS) / Azure Security Center

---

## 📊 Security Monitoring

### Logging

```yaml
Log Types Collected:
  - API access logs
  - Authentication events
  - Authorization failures
  - Data access logs
  - System events
  - Audit logs

Retention:
  - Real-time: 30 days
  - Archived: 1 year
  - Compliance: 7 years
```

### Key Metrics to Monitor

- Authentication success/failure rates
- Unauthorized access attempts
- API rate limit breaches
- Unusual data access patterns
- System resource anomalies

### Alerts Configuration

```yaml
Critical Alerts (PagerDuty/Slack):
  - More than 10 failed logins in 5 minutes
  - Suspicious IP access
  - Rate limit exceeded by 200%
  - Security header violations
  - Vulnerable component detected

Warning Alerts (Email):
  - New user registration (admin only)
  - Role changes
  - Password reset requests
  - API key rotation
  - SSL certificate expiry < 30 days
```

---

## 🚨 Incident Response

### Response Plan

#### 1. Detection Phase

- Identify and classify the incident
- Determine scope and impact
- Notify security team
- Document initial findings

#### 2. Containment Phase

- Isolate affected systems
- Stop the attack progression
- Preserve evidence
- Implement temporary fixes

#### 3. Eradication Phase

- Remove root cause
- Clean infected systems
- Apply patches
- Update security controls

#### 4. Recovery Phase

- Restore from clean backups
- Validate system integrity
- Monitor for recurrence
- Gradual system restoration

#### 5. Post-Incident

- Root cause analysis
- Update security policies
- Document lessons learned
- Notify affected parties

### Incident Severity Levels

| Level             | Definition                                  | Response Time      | Communication  |
| ----------------- | ------------------------------------------- | ------------------ | -------------- |
| **P1 - Critical** | Data breach, system compromise              | Immediate (15 min) | Executive team |
| **P2 - High**     | Authentication bypass, privilege escalation | 1 hour             | Security team  |
| **P3 - Medium**   | Vulnerability detected, suspicious activity | 4 hours            | Security team  |
| **P4 - Low**      | Policy violations, minor issues             | 24 hours           | Security team  |

### Emergency Contacts

- **Security Lead:** [Name] - [Email] - [Phone]
- **Infrastructure Lead:** [Name] - [Email] - [Phone]
- **Development Lead:** [Name] - [Email] - [Phone]
- **CISO/Compliance:** [Name] - [Email] - [Phone]

---

## 📝 Reporting Vulnerabilities

### How to Report

If you discover a security vulnerability:

1. **DO NOT** disclose publicly
2. Email: `security@duediligence.com`
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Affected components
   - Potential impact
   - Your contact information

### Responsible Disclosure Policy

| Severity | Response Time | Fix Time |
| -------- | ------------- | -------- |
| Critical | 1 hour        | 24 hours |
| High     | 4 hours       | 72 hours |
| Medium   | 24 hours      | 7 days   |
| Low      | 48 hours      | 30 days  |

### What to Expect

- Acknowledgment of report within **24 hours**
- Status updates every **48 hours**
- Credit for responsible disclosure
- No legal action for responsible reporters

---

## ✅ Security Checklist

### Pre-Deployment Checklist

- [ ] All dependencies updated and scanned
- [ ] SSL/TLS certificates valid
- [ ] HTTPS enforcement enabled
- [ ] Security headers configured
- [ ] Database encryption configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] XSS protection enabled

### Regular Maintenance

- [ ] Weekly: Review audit logs
- [ ] Monthly: Security patch updates
- [ ] Monthly: Dependency vulnerability scan
- [ ] Quarterly: Penetration testing
- [ ] Quarterly: Security training for team
- [ ] Annually: Third-party security audit
- [ ] Annually: Certificate renewal
- [ ] Annually: Review security policies

### Development Practices

- [ ] Code reviews mandatory for all changes
- [ ] SAST tools integrated in CI/CD
- [ ] DAST tools integrated in CI/CD
- [ ] Secrets never stored in code
- [ ] No credentials in Git
- [ ] Environment variables for all secrets
- [ ] Unit tests include security tests
- [ ] Integration tests for auth flows

---

## 🔧 Environment-Specific Configurations

### Development

```yaml
security:
  debug: true
  rate_limit: 1000/minute
  jwt_expiry: 24h
  use_https: false
  password_complexity: medium
```

### Staging

```yaml
security:
  debug: false
  rate_limit: 200/minute
  jwt_expiry: 24h
  use_https: true
  password_complexity: high
  mock_external_apis: true
```

### Production

```yaml
security:
  debug: false
  rate_limit: 100/minute
  jwt_expiry: 8h
  use_https: true
  password_complexity: very_high
  mock_external_apis: false
  enable_audit: true
  enable_waf: true
```

---

## 📚 Compliance Reference

### GDPR Compliance

- Right to access data
- Right to rectify data
- Right to delete data
- Data portability
- Consent management
- Data Processing Agreement (DPA)

### Indian Regulations

- Data localization requirements
- Banking/Financial data handling
- Real estate transaction records
- KYC compliance for property deals

---

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Spring Security Documentation](https://docs.spring.io/spring-security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [NIST Guidelines](https://csrc.nist.gov/publications)
- [CIS Benchmarks](https://www.cisecurity.org/benchmark/)

---

## 📞 Contact

**Security Team:**

- Email: `security@duediligence.com`
- PGP Key: [Available upon request]
- Bug Bounty Program: [Details available]

**Incident Response Hotline:**

- [Phone Number]
- 24/7 availability

---

**Last Updated:** July 2026
**Next Review:** October 2026
**Responsible Team:** Security & Compliance

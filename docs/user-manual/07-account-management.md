# Chapter 7 — Account Management

## Viewing your profile

1. Click your name or avatar in the top-right corner of the navigation bar.
2. Select **Profile** (or go to `/dashboard/profile`).

Your profile shows:
- Full name
- Email address
- Phone number
- Role
- Profile picture (Google-linked accounts show the Google photo)
- Account creation date

---

## Updating your profile

1. Go to `/dashboard/profile`.
2. Click **Edit Profile**.
3. Update your **full name**, **phone number**, or **profile picture URL**.
4. Click **Save Changes**.

> **Note:** Email address and role cannot be changed from the profile page.
> Contact an administrator to change your role.

---

## Changing your password

1. Go to **Settings** → **Security** (or `/dashboard/settings`).
2. Click **Change Password**.
3. Enter your **current password** and your new password (minimum 8 characters).
4. Click **Update Password**.

---

## Resetting a forgotten password

1. Go to `/login`.
2. Click **Forgot password?**
3. Enter your registered email address and click **Send OTP**.
4. Check your email for a 6-digit OTP and enter it.
5. Set your new password and click **Reset Password**.

---

## Notification preferences

Control which notifications you receive and how:

1. Go to **Settings** → **Notifications** (or `/settings/notifications`).
2. Toggle each notification type on or off per channel:

| Notification type | Email | In-app |
|-------------------|-------|--------|
| Report Ready | ✅ on | ✅ on |
| Risk Alert | ✅ on | ✅ on |
| Price Change | off | ✅ on |
| System | ✅ on | ✅ on |

3. Changes are saved automatically.

---

## Viewing notifications

Click the **bell icon** (🔔) in the navigation bar to open the notifications panel.

The panel shows your recent notifications grouped as **Today**, **Earlier**, and **Older**.
Click any notification to navigate to the relevant page (e.g. a completed report).

To mark all as read: click **Mark all read** at the top of the panel.
To clear all: click **Clear all**.

For the full notification history, click **View all** → `/dashboard/notifications`.

---

## Managing your subscription

1. Go to **Settings** → **Billing** (or `/dashboard/billing`).
2. Your current plan and usage are shown:
   - Current plan (FREE / PRO / BUSINESS)
   - Reports generated this month
   - Reports remaining
   - Plan expiry date (for paid plans)

### Upgrading your plan

1. On the Billing page, click **Upgrade**.
2. Select a plan (PRO or BUSINESS).
3. Click **Subscribe** — you are redirected to the Cashfree checkout (UPI, cards, net banking).
4. Complete payment. Your plan is activated within seconds after the payment webhook is received.

### Cancelling your plan

1. On the Billing page, click **Cancel Plan**.
2. Confirm cancellation.
3. Your access continues until the current billing period ends.

---

## Logging out of all devices

If you suspect your account has been accessed without permission:

1. Go to **Settings** → **Security**.
2. Click **Log out all devices**.
3. All active sessions (on all browsers and devices) are immediately invalidated.
4. You are redirected to the login page.

---

## Deleting your account

> ⚠️ **This is irreversible.** All your properties, reports, risk assessments, and data are permanently deleted.

1. Go to **Settings** → **Account**.
2. Click **Delete Account**.
3. Enter your **current password** and type `DELETE` to confirm.
4. Click **Delete My Account**.

Your account and all associated data are immediately and permanently removed.

---

## Security best practices

- Use a strong password (12+ characters, mix of letters, numbers, symbols).
- Enable Google Sign-In for faster and more secure login.
- Log out of all devices if you change your password.
- Never share your credentials with anyone.
- Contact your administrator if you notice unexpected login-alert emails.

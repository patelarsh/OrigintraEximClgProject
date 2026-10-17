/**
 * ===============================================================
 * Origintra Exim - Corporate User Email & Credentials Service
 * ===============================================================
 * 
 * Manages email server credentials (Hostinger SMTP / Custom SMTP / Webhooks)
 * and dispatches account welcome credentials, test emails, and corporate notices.
 */

export interface EmailCredentials {
  provider: 'hostinger_smtp' | 'custom_smtp' | 'resend' | 'webhook';
  senderEmail: string;       // e.g. "export@origintra.com" or "info@origintra.com"
  senderName: string;        // e.g. "Origintra Exim Administration"
  smtpHost: string;          // e.g. "smtp.hostinger.com"
  smtpPort: number;          // e.g. 465 (SSL) or 587 (TLS)
  smtpSecure: boolean;       // SSL encryption
  smtpUser: string;          // e.g. "export@origintra.com"
  smtpPassword: string;      // Password / App password
  webhookUrl?: string;       // Optional HTTP webhook (e.g. Formspree/Zapier/Resend)
  apiKey?: string;           // Optional API key
  autoSendOnUserCreate: boolean; // Automatically deliver directly via server
}

export const DEFAULT_EMAIL_CREDENTIALS: EmailCredentials = {
  provider: 'hostinger_smtp',
  senderEmail: 'export@origintra.com',
  senderName: 'Origintra Exim Administration Desk',
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'export@origintra.com',
  smtpPassword: '',
  webhookUrl: '',
  apiKey: '',
  autoSendOnUserCreate: true
};

const CREDENTIALS_KEY = 'origintra_email_credentials_v1';

export interface WelcomeEmailPayload {
  toEmail: string;
  userName: string;
  password: string;
  role: string;
  department?: string;
  loginUrl?: string;
  adminName?: string;
}

export function formatWelcomeEmail(payload: WelcomeEmailPayload): {
  subject: string;
  body: string;
  html: string;
  mailtoUrl: string;
} {
  const portalUrl =
    payload.loginUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/admin` : 'https://www.origintra.com/admin');

  const roleLabels: Record<string, string> = {
    admin: 'Super Administrator',
    editor: 'Content & Catalog Editor',
    author: 'Trade Insights Staff Author',
    sales: 'Sales & Quote Specialist Desk'
  };

  const roleDisplay = roleLabels[payload.role.toLowerCase()] || payload.role.toUpperCase();
  const departmentName = payload.department || 'Trade Operations';
  const adminSender = payload.adminName || 'Origintra Exim Administration';

  const subject = `Welcome to Origintra Exim — Your Corporate Portal Credentials`;

  const body = `Dear ${payload.userName},

Your user account has been successfully created by ${adminSender} for the Origintra Exim Corporate Portal.

Here are your account access details and login credentials:
======================================================================
Corporate Portal URL : ${portalUrl}
Login Email          : ${payload.toEmail}
Temporary Password   : ${payload.password}
Assigned Role        : ${roleDisplay}
Department           : ${departmentName}
======================================================================

How to Access the Portal:
1. Click or navigate to: ${portalUrl}
2. Enter your corporate email: ${payload.toEmail}
3. Enter your temporary password: ${payload.password}
4. Click "Authenticate & Enter Portal"

Important Security Notice:
- Please keep your credentials strictly confidential.
- For enhanced account security, we recommend changing your password after your first sign in from the "Users & Roles" settings.

If you have any questions or require administrative assistance, please contact the Trade Desk Administrator at info@patelarsh.com.

Best regards,
Origintra Exim Administration Desk
Global Agro-Commodities Export Desk
Website: https://www.origintra.com
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0A1C3E; padding: 24px 32px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">ORIGINTRA EXIM</h1>
      <p style="margin: 4px 0 0; font-size: 12px; color: #38BDF8; text-transform: uppercase; letter-spacing: 1px;">Corporate Portal Access</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 15px; margin-top: 0;">Dear <strong>${payload.userName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Your corporate staff account has been created by <strong>${adminSender}</strong>. You now have authorized access to the Origintra Exim Management Portal.
      </p>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #cbd5e1;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Portal URL:</td>
            <td style="padding: 6px 0; font-weight: 600;"><a href="${portalUrl}" style="color: #0070E0; text-decoration: none;">${portalUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Login Email:</td>
            <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #0f172a;">${payload.toEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Temporary Password:</td>
            <td style="padding: 6px 0; font-family: monospace; font-size: 14px; font-weight: 700; color: #0284c7;">${payload.password}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Assigned Role:</td>
            <td style="padding: 6px 0; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #0369a1;">${roleDisplay}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Department:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #334155;">${departmentName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${portalUrl}" style="display: inline-block; background-color: #0070E0; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 112, 224, 0.2);">Sign In to Corporate Portal &rarr;</a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
        <strong>Security Tip:</strong> Please keep these credentials confidential. You can update your password at any time in your profile settings.
      </p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #64748b; text-align: center;">
      Origintra Exim — Global Agro-Commodities Trading Desk<br>
      <a href="https://www.origintra.com" style="color: #64748b;">www.origintra.com</a>
    </div>
  </div>
</body>
</html>
`;

  const mailtoUrl = `mailto:${encodeURIComponent(payload.toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { subject, body, html, mailtoUrl };
}

export const MailService = {
  /**
   * Retrieves saved email credentials from localStorage or defaults
   */
  getCredentials(): EmailCredentials {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(CREDENTIALS_KEY);
        if (raw) {
          return { ...DEFAULT_EMAIL_CREDENTIALS, ...JSON.parse(raw) };
        }
      }
    } catch (e) {
      console.warn('[MailService] Failed to load credentials from storage:', e);
    }
    return { ...DEFAULT_EMAIL_CREDENTIALS };
  },

  /**
   * Saves email credentials to localStorage
   */
  saveCredentials(creds: EmailCredentials): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
        window.dispatchEvent(new CustomEvent('origintra_email_credentials_updated', { detail: creds }));
      }
    } catch (e) {
      console.error('[MailService] Failed to save credentials:', e);
    }
  },

  /**
   * Dispatches email via Hostinger PHP mailer (/api/send-mail.php) or configured webhook
   */
  async sendDirectEmail(options: {
    to: string;
    subject: string;
    body: string;
    html?: string;
  }): Promise<{ success: boolean; message: string; method?: string }> {
    const creds = this.getCredentials();

    // Strategy 1: External Webhook (if configured)
    if (creds.provider === 'webhook' && creds.webhookUrl?.trim()) {
      try {
        const res = await fetch(creds.webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: options.to,
            subject: options.subject,
            text: options.body,
            html: options.html,
            from: creds.senderEmail,
            senderName: creds.senderName
          })
        });
        if (!res.ok) throw new Error(`Webhook returned status ${res.status}`);
        return { success: true, message: `Dispatched successfully via webhook to ${options.to}`, method: 'Webhook' };
      } catch (e: any) {
        return { success: false, message: `Webhook delivery failed: ${e?.message || e}` };
      }
    }

    // Strategy 2: Nodemailer / Server Endpoint (/api/send-mail or /api/send-mail.php)
    const endpoints = ['/api/send-mail', '/api/send-mail.php'];
    let lastError = 'Delivery endpoint unreachable.';

    for (const endpoint of endpoints) {
      try {
        const payload = {
          to: options.to,
          subject: options.subject,
          body: options.body,
          html: options.html,
          senderEmail: creds.senderEmail || 'export@origintra.com',
          senderName: creds.senderName || 'Origintra Exim Administration',
          smtp: creds.smtpPassword ? {
            host: creds.smtpHost || 'smtp.hostinger.com',
            port: Number(creds.smtpPort) || 465,
            secure: creds.smtpSecure !== undefined ? creds.smtpSecure : (Number(creds.smtpPort) === 465),
            user: creds.smtpUser || creds.senderEmail,
            pass: creds.smtpPassword,
            name: creds.senderName
          } : null
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success) {
          return {
            success: true,
            message: json.message || `Email sent successfully to ${options.to}`,
            method: json.method || 'Nodemailer'
          };
        }

        if (json && !json.success) {
          lastError = json.message || 'Server mailer reported failure.';
          // If server explicitly responded with failure, don't try next endpoint
          break;
        }

        lastError = `Server returned HTTP ${res.status}`;
      } catch (e: any) {
        lastError = e?.message || lastError;
      }
    }

    return {
      success: false,
      message: lastError
    };
  },

  /**
   * Tests and verifies SMTP credentials via Nodemailer backend
   */
  async verifySmtp(credsOverride?: Partial<EmailCredentials>): Promise<{ success: boolean; message: string }> {
    const creds = { ...this.getCredentials(), ...(credsOverride || {}) };
    try {
      const res = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: creds.smtpHost,
          port: creds.smtpPort,
          secure: creds.smtpSecure,
          user: creds.smtpUser,
          pass: creds.smtpPassword
        })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        return { success: true, message: data.message || 'SMTP connection verified successfully!' };
      }
      return { success: false, message: data?.message || `Verification returned HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Could not connect to SMTP verification endpoint.' };
    }
  },

  /**
   * Sends a live test email to verify credentials
   */
  async sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
    const creds = this.getCredentials();
    const subject = `[Test Verification] Origintra Exim Email System`;
    const body = `Hello,

This is a live test email from Origintra Exim Corporate Portal.
If you are reading this, your email credentials and mail server connection are operating correctly!

Configuration Summary:
- Mail Server : ${creds.smtpHost}:${creds.smtpPort}
- Sender ID   : ${creds.senderEmail}
- Date & Time : ${new Date().toLocaleString()}

Best regards,
Origintra Exim Trade Desk
`;

    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
        <h2 style="color: #0070E0; margin-top: 0;">Origintra Exim — Email Verification</h2>
        <p>This is a live test email from the <strong>Origintra Exim Corporate Portal</strong>.</p>
        <p style="color: #16a34a; font-weight: bold;">&#10003; Your email credentials and mail connection are fully verified!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #64748b;">
          <strong>Server:</strong> ${creds.smtpHost}:${creds.smtpPort}<br>
          <strong>Sender:</strong> ${creds.senderEmail}<br>
          <strong>Timestamp:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return this.sendDirectEmail({
      to: targetEmail,
      subject,
      body,
      html
    });
  },

  /**
   * Dispatches welcome credentials to a newly created user.
   * Tries direct automated send first, then falls back to 1-click mail client.
   */
  async dispatchWelcomeEmail(
    payload: WelcomeEmailPayload
  ): Promise<{ deliveredDirectly: boolean; message: string }> {
    const creds = this.getCredentials();
    const { subject, body, html } = formatWelcomeEmail(payload);

    if (creds.autoSendOnUserCreate && (creds.smtpPassword || creds.webhookUrl)) {
      const result = await this.sendDirectEmail({
        to: payload.toEmail,
        subject,
        body,
        html
      });

      if (result.success) {
        return {
          deliveredDirectly: true,
          message: `Credentials emailed directly to ${payload.toEmail} via ${result.method || 'configured mailer'}.`
        };
      }
    }

    // Fallback: trigger desktop/mobile mail client
    this.openMailClient(payload);
    return {
      deliveredDirectly: false,
      message: `Mail client opened to dispatch credentials to ${payload.toEmail}.`
    };
  },

  /**
   * Opens default email client (Outlook, Apple Mail, Gmail, Windows Mail)
   */
  openMailClient(payload: WelcomeEmailPayload): void {
    const { mailtoUrl } = formatWelcomeEmail(payload);
    if (typeof window === 'undefined') return;

    try {
      const a = document.createElement('a');
      a.href = mailtoUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {}
      }, 500);
    } catch (e) {
      console.warn('[MailService] Failed to trigger mailto client:', e);
      window.location.href = mailtoUrl;
    }
  },

  /**
   * Copies formatted email text to clipboard
   */
  async copyEmailTemplate(payload: WelcomeEmailPayload): Promise<boolean> {
    const { body } = formatWelcomeEmail(payload);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(body);
        return true;
      }
    } catch (e) {
      console.warn('[MailService] Clipboard write failed:', e);
    }
    return false;
  },

  /**
   * Legacy webhook dispatch wrapper
   */
  async sendViaWebhook(
    payload: WelcomeEmailPayload,
    customUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    const creds = this.getCredentials();
    const url = customUrl || creds.webhookUrl;
    if (!url) {
      return { success: false, message: 'No webhook configured.' };
    }
    const { subject, body, html } = formatWelcomeEmail(payload);
    return this.sendDirectEmail({
      to: payload.toEmail,
      subject,
      body,
      html
    });
  }
};

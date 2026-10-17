/**
 * ===============================================================
 * Origintra Exim - Corporate User Email & Credentials Service
 * ===============================================================
 * 
 * Automatically composes and dispatches account welcome emails
 * with credentials whenever a new user is created by the Admin.
 */

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

  const mailtoUrl = `mailto:${encodeURIComponent(payload.toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl };
}

export const MailService = {
  /**
   * Automatically opens the administrator's default desktop/mobile email client
   * (Outlook, Apple Mail, Gmail, Thunderbird, Windows Mail) with the welcome email
   * pre-composed, pre-addressed, and ready to send.
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
      // Fallback
      window.location.href = mailtoUrl;
    }
  },

  /**
   * Copies formatted email template to the clipboard for WhatsApp, Slack,
   * or manual email pasting.
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
   * Optional automated webhook dispatch (e.g. Formspree, Resend, Brevo, or custom serverless function).
   */
  async sendViaWebhook(
    payload: WelcomeEmailPayload,
    customUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    const url =
      customUrl ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('origintra_email_webhook_url') : '') ||
      '';

    if (!url) {
      return {
        success: false,
        message: 'No external email webhook configured. Defaulting to 1-click mail client.'
      };
    }

    const { subject, body } = formatWelcomeEmail(payload);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.toEmail,
          name: payload.userName,
          subject,
          text: body,
          role: payload.role,
          credentials: {
            email: payload.toEmail,
            password: payload.password,
            loginUrl: payload.loginUrl || 'https://www.origintra.com/admin'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return { success: true, message: `Email dispatched successfully to ${payload.toEmail}` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Webhook request failed' };
    }
  }
};

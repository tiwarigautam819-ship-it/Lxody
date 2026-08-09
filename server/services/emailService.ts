import nodemailer from 'nodemailer';

// Helper to send email notification (SMTP or simulated Cloud Function dispatch)
export async function sendEmailNotification({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  console.log(`[Firebase Cloud Function Email Trigger] Preparing email to ${to} | Subject: "${subject}"`);

  // Configured SMTP or fallback logging
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'notifications@agtechsmm.com',
      pass: process.env.SMTP_PASS || 'app-password'
    }
  });

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: '"AG Tech SMM Support" <notifications@agtechsmm.com>',
        to,
        subject,
        text,
        html
      });
      console.log(`[Firebase Cloud Function Email Trigger] Real SMTP Email dispatched successfully to ${to}`);
      return { success: true, method: 'smtp' };
    } else {
      console.log(`[Firebase Cloud Function Email Trigger] Simulating Firebase Cloud Function email trigger send to ${to}`);
      console.log(`[Email Preview] To: ${to} | Subject: ${subject}`);
      return { success: true, method: 'cloud_function_simulation' };
    }
  } catch (err: any) {
    console.error('[Firebase Cloud Function Email Trigger] Email dispatch error:', err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Triggers notification when an order status changes
 */
export async function triggerOrderStatusNotification({
  orderId,
  userEmail,
  serviceName,
  oldStatus,
  newStatus,
  charge
}: {
  orderId: string;
  userEmail: string;
  serviceName: string;
  oldStatus: string;
  newStatus: string;
  charge: number;
}) {
  const subject = `Order #${orderId} Status Updated to ${newStatus} | AG Tech SMM`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold;">AG Tech SMM</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Order Status Notification</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0;">Order #${orderId} Update</h2>
        <p>Hello,</p>
        <p>The status of your order has been updated to <strong style="color: #2563eb; font-size: 16px;">${newStatus}</strong>.</p>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 4px 0;"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${charge}</p>
          <p style="margin: 4px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
          <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-weight: bold;">${newStatus}</span></p>
        </div>

        <p>Log in to your account to review your order details and delivery status.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        AG Tech SMM - Fast & Reliable Social Media Marketing Services
      </div>
    </div>
  `;

  return sendEmailNotification({
    to: userEmail,
    subject,
    html,
    text: `Order #${orderId} status updated to ${newStatus}. Check your dashboard for details.`
  });
}

/**
 * Triggers notification when an admin replies to a support ticket
 */
export async function triggerTicketReplyNotification({
  ticketId,
  userEmail,
  subject,
  adminMessage
}: {
  ticketId: string;
  userEmail: string;
  subject: string;
  adminMessage: string;
}) {
  const emailSubject = `[Support Ticket #${ticketId}] New Reply from Admin | AG Tech SMM`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold;">AG Tech SMM Support</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Helpdesk Ticket Notification</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0;">New Admin Response</h2>
        <p>Hello,</p>
        <p>Our support team has responded to your ticket <strong>#${ticketId} - "${subject}"</strong>.</p>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b;">ADMIN MESSAGE:</p>
          <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap;">${adminMessage}</p>
        </div>

        <p>To reply or view your ticket history, log in to your account support desk.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        AG Tech SMM Customer Care & Helpdesk
      </div>
    </div>
  `;

  return sendEmailNotification({
    to: userEmail,
    subject: emailSubject,
    html,
    text: `Support Ticket #${ticketId} update: Admin replied: "${adminMessage}".`
  });
}

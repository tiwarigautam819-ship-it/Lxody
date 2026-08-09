const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure Transporter for email notifications (defaults to test ethereal or SMTP credentials if available)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'notifications@agtechsmm.com',
    pass: process.env.SMTP_PASS || 'agtech-app-password'
  }
});

/**
 * Send HTML Email Helper
 */
async function sendEmailNotification({ to, subject, html, text }) {
  const mailOptions = {
    from: '"AG Tech SMM Support" <notifications@agtechsmm.com>',
    to,
    subject,
    text,
    html
  };

  try {
    // Write email to 'mail' collection if using Firebase Trigger Email Extension
    await db.collection('mail').add({
      to: [to],
      message: {
        subject,
        text,
        html
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[Firebase Cloud Function] Email queued in 'mail' collection for ${to}`);

    // If SMTP is configured, send directly as well
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`[Firebase Cloud Function] SMTP Email sent directly to ${to}`);
    }

    return { success: true };
  } catch (err) {
    console.error('[Firebase Cloud Function] Error sending email notification:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Cloud Function Trigger: Order Status Changed
 * Triggers when an order document in /orders/{orderId} or /smm_panel/orders is updated
 */
exports.onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed
    if (!beforeData || !afterData || beforeData.status === afterData.status) {
      return null;
    }

    const { orderId } = context.params;
    const userEmail = afterData.userEmail;
    const serviceName = afterData.serviceName || 'SMM Service';
    const oldStatus = beforeData.status;
    const newStatus = afterData.status;
    const quantity = afterData.quantity || 0;
    const charge = afterData.charge || 0;

    console.log(`[Cloud Function] Order #${orderId} status changed from "${oldStatus}" to "${newStatus}" for user ${userEmail}`);

    if (!userEmail) {
      console.warn(`[Cloud Function] No userEmail found for order #${orderId}`);
      return null;
    }

    const emailSubject = `Order #${orderId} Status Update: ${newStatus} | AG Tech SMM`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">AG Tech SMM</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Order Status Notification</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <h2 style="color: #0f172a; margin-top: 0;">Order #${orderId} Update</h2>
          <p>Hello,</p>
          <p>The status of your order has been updated to <strong style="color: #2563eb; font-size: 16px;">${newStatus}</strong>.</p>

          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin: 4px 0;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 4px 0;"><strong>Quantity:</strong> ${quantity}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${charge}</p>
            <p style="margin: 4px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
            <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-weight: bold;">${newStatus}</span></p>
          </div>

          <p>You can check your full order history anytime in your account dashboard.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://agtechsmm.com/orders" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Orders</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated notification from AG Tech SMM. Please do not reply directly to this email.
        </div>
      </div>
    `;

    // 1. Create in-app notification in Firestore
    if (afterData.userId) {
      await db.collection('notifications').add({
        userId: afterData.userId,
        userEmail,
        type: 'order_status_change',
        title: `Order #${orderId} is now ${newStatus}`,
        message: `Your order for "${serviceName}" has changed status from ${oldStatus} to ${newStatus}.`,
        link: '/orders',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 2. Dispatch Email
    return sendEmailNotification({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `Order #${orderId} status updated to ${newStatus} for ${serviceName}. Check your dashboard for details.`
    });
  });

/**
 * 2. Cloud Function Trigger: Support Ticket Replied by Admin
 * Triggers when a support ticket document in /tickets/{ticketId} is updated
 */
exports.onTicketAdminReplied = functions.firestore
  .document('tickets/{ticketId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!beforeData || !afterData) return null;

    const beforeMsgs = beforeData.messages || [];
    const afterMsgs = afterData.messages || [];

    // Check if new message was added by Admin
    if (afterMsgs.length <= beforeMsgs.length) return null;

    const latestMsg = afterMsgs[afterMsgs.length - 1];
    if (latestMsg.sender !== 'admin') {
      return null; // Not an admin reply
    }

    const { ticketId } = context.params;
    const userEmail = afterData.userEmail;
    const subject = afterData.subject || 'Support Request';
    const adminMessage = latestMsg.message || '';

    console.log(`[Cloud Function] Admin replied to Support Ticket #${ticketId} for user ${userEmail}`);

    if (!userEmail) return null;

    const emailSubject = `[Support Ticket #${ticketId}] New Reply from Admin | AG Tech SMM`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">AG Tech SMM Support</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Ticket Reply Notification</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <h2 style="color: #0f172a; margin-top: 0;">New Admin Response</h2>
          <p>Hello,</p>
          <p>Our support team has responded to your ticket <strong>#${ticketId} - "${subject}"</strong>.</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b;">ADMIN MESSAGE:</p>
            <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap;">${adminMessage}</p>
          </div>

          <p>To reply or view your ticket history, click the button below:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://agtechsmm.com/support" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Ticket in Panel</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          AG Tech SMM Customer Care & Helpdesk
        </div>
      </div>
    `;

    // 1. Create in-app notification in Firestore
    if (afterData.userId) {
      await db.collection('notifications').add({
        userId: afterData.userId,
        userEmail,
        type: 'ticket_reply',
        title: `Admin replied to Ticket #${ticketId}`,
        message: `New support message on "${subject}": ${adminMessage.substring(0, 100)}...`,
        link: '/support',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 2. Dispatch Email
    return sendEmailNotification({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `Support Ticket #${ticketId} update: Admin replied: "${adminMessage}". View details in your account.`
    });
  });

/**
 * 3. HTTPS Callable Cloud Function: sendEmailTrigger
 * Direct HTTPS Endpoint to trigger notification emails on demand from backend or admin panel
 */
exports.sendEmailTrigger = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { type, to, orderId, ticketId, oldStatus, newStatus, message, serviceName, subject } = req.body;

    if (!to) {
      res.status(400).json({ error: 'Recipient email "to" is required' });
      return;
    }

    let emailSubject = '';
    let emailHtml = '';

    if (type === 'order_status_change') {
      emailSubject = `Order #${orderId} Status Update: ${newStatus} | AG Tech SMM`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">Order Status Updated</h2>
          <p>Your order <strong>#${orderId}</strong> (${serviceName || 'SMM Service'}) has changed status to <strong style="color: #1d4ed8;">${newStatus}</strong>.</p>
          <p>Previous Status: ${oldStatus || 'N/A'}</p>
          <hr/>
          <p style="font-size: 12px; color: #64748b;">AG Tech SMM Automated Notification</p>
        </div>
      `;
    } else if (type === 'ticket_reply') {
      emailSubject = `[Support Ticket #${ticketId}] New Admin Reply | AG Tech SMM`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">New Support Message</h2>
          <p>Admin responded to Ticket <strong>#${ticketId}</strong> (${subject || 'Support Ticket'}):</p>
          <blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${message}
          </blockquote>
          <hr/>
          <p style="font-size: 12px; color: #64748b;">AG Tech SMM Helpdesk</p>
        </div>
      `;
    } else {
      res.status(400).json({ error: 'Invalid notification type' });
      return;
    }

    const result = await sendEmailNotification({
      to,
      subject: emailSubject,
      html: emailHtml,
      text: emailSubject
    });

    res.json({ success: true, message: 'Email notification sent successfully!', result });
  } catch (err) {
    console.error('sendEmailTrigger Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

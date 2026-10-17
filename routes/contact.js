const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to send real email to aryay0108@gmail.com
async function sendDirectEmail({ name, email, subject, message }) {
  const recipientEmail = process.env.RECEIVER_EMAIL || 'aryay0108@gmail.com';
  const emailUser = process.env.EMAIL_USER || 'avuy2207@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'nxobjqecapjusqcy';

  if (!emailPass || !emailUser) {
    console.warn(`⚠️ [Email System] Missing EMAIL_PASS or EMAIL_USER. Cannot send email to ${recipientEmail}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"Portfolio Contact - ${name}" <${emailUser}>`,
    replyTo: `"${name}" <${email}>`,
    to: recipientEmail,
    subject: `📩 [Portfolio] ${subject || 'New Message from ' + name}`,
    text: `You have received a new contact message from your portfolio website!\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'Portfolio Inquiry'}\n\nMessage:\n${message}\n\n---\nDelivered to: ${recipientEmail}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; color: #f8fafc;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #a78bfa; margin: 0; font-size: 20px;">New Portfolio Contact Message</h2>
          <span style="background: rgba(167, 139, 250, 0.15); color: #c084fc; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(167, 139, 250, 0.3);">PORTFOLIO</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600; width: 90px;">From:</td>
            <td style="padding: 8px 0; color: #f8fafc;"><strong>${name}</strong> (&lt;<a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a>&gt;)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Subject:</td>
            <td style="padding: 8px 0; color: #f8fafc;">${subject || 'Portfolio Inquiry'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Date:</td>
            <td style="padding: 8px 0; color: #f8fafc;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
          </tr>
        </table>
        <div style="background: #1e293b; border-left: 4px solid #a78bfa; padding: 18px; border-radius: 6px; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
${message}
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; text-align: center;">
          <a href="mailto:${email}?subject=${encodeURIComponent('Re: ' + (subject || 'Portfolio Inquiry'))}" style="display: inline-block; background: #8b5cf6; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Reply to ${name}</a>
          <p style="font-size: 12px; color: #64748b; margin-top: 12px; margin-bottom: 0;">
            This email was sent from your portfolio website contact form and delivered directly to <strong>${recipientEmail}</strong>.
          </p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [Email System] Real email successfully sent to ${recipientEmail} from ${email} (id: ${info.messageId})`);
  return true;
}

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.',
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  try {
    // 1. Save to MongoDB if connected
    if (isDbConnected()) {
      const Contact = require('../models/Contact');
      await Contact.create({ name, email, subject: subject || 'Portfolio Inquiry', message });
    }

    // 2. Dispatch real email via Nodemailer
    const sent = await sendDirectEmail({ name, email, subject, message });

    console.log(`📧 New contact from ${name} <${email}>: ${message.substring(0, 40)}... (Email sent: ${sent})`);
    res.status(201).json({
      success: true,
      message: "Thanks for reaching out! Your message was delivered directly to Arjav's inbox. 🚀",
      emailSent: Boolean(sent)
    });
  } catch (err) {
    console.error('❌ Error processing contact form:', err);
    res.status(500).json({ success: false, message: 'Failed to send message: ' + (err.message || 'Server error') });
  }
});

// GET /api/contact (admin - list all messages)
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: [], source: 'no-db' });
    }
    const Contact = require('../models/Contact');
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

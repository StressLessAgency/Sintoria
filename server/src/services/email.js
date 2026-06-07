import nodemailer from 'nodemailer';

let transporter;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function tryDeliver(mail) {
  if (!isConfigured()) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  try {
    await getTransporter().sendMail(mail);
    return { sent: true };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { sent: false, reason: 'SMTP_SEND_ERROR', error: err.message };
  }
}

export async function sendVerificationEmail(email, username, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;
  return tryDeliver({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'THREES — Verify your account',
    html: `
      <div style="background:#0A0907;color:#E8E2D6;padding:40px;font-family:Georgia,serif;">
        <h1 style="color:#C8862A;font-size:32px;">THREES</h1>
        <p>Welcome, ${username}.</p>
        <p>Verify your account to start playing:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 32px;background:#C8862A;color:#0A0907;text-decoration:none;font-weight:bold;margin:20px 0;">
          VERIFY ACCOUNT
        </a>
        <p style="color:#6B6560;font-size:12px;margin-top:40px;">
          If you didn't create this account, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email, username, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return tryDeliver({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'THREES — Reset your password',
    html: `
      <div style="background:#0A0907;color:#E8E2D6;padding:40px;font-family:Georgia,serif;">
        <h1 style="color:#C8862A;font-size:32px;">THREES</h1>
        <p>${username}, reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#C8862A;color:#0A0907;text-decoration:none;font-weight:bold;margin:20px 0;">
          RESET PASSWORD
        </a>
        <p style="color:#6B6560;font-size:12px;margin-top:40px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

export { isConfigured as isEmailConfigured };

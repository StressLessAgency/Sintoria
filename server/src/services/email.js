import nodemailer from 'nodemailer';

let transporter;

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

export async function sendVerificationEmail(email, username, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

  try {
    await getTransporter().sendMail({
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
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't throw — email failure shouldn't block registration
  }
}

export async function sendPasswordResetEmail(email, username, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await getTransporter().sendMail({
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
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

export async function sendWithdrawalConfirmation(email, username, amountCents) {
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'THREES — Withdrawal initiated',
      html: `
        <div style="background:#0A0907;color:#E8E2D6;padding:40px;font-family:Georgia,serif;">
          <h1 style="color:#C8862A;font-size:32px;">THREES</h1>
          <p>${username}, your withdrawal of $${(amountCents / 100).toFixed(2)} has been initiated.</p>
          <p>Processing typically takes 3–5 business days.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

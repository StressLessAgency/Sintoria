import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../app.js';
import { authMiddleware, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateAge, checkSelfExclusion } from '../middleware/compliance.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { creditGrant } from '../services/ledger.js';

const WELCOME_CHIPS = parseInt(process.env.WELCOME_CHIPS || '5000', 10);

const router = Router();

// Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, username, password, confirmPassword, dateOfBirth } = req.body;

    // Validation
    if (!email || !username || !password || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3–20 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
    }

    // Age check
    if (!validateAge(dateOfBirth)) {
      return res.status(403).json({ error: 'You must be 18 or older to register' });
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} already in use` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        dateOfBirth: new Date(dateOfBirth),
        verifyToken,
        wallet: { create: { balanceCents: 0 } },
        responsibleGambling: { create: {} },
      },
    });

    if (WELCOME_CHIPS > 0) {
      try {
        await creditGrant(user.id, WELCOME_CHIPS, 'welcome');
      } catch (err) {
        console.error('Welcome grant failed:', err);
      }
    }

    sendVerificationEmail(email, username, verifyToken).catch((err) =>
      console.error('Verification email failed:', err)
    );

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      userId: user.id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) return res.status(404).json({ error: 'Invalid or expired token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    // Check self-exclusion
    const exclusion = await checkSelfExclusion(user.id);
    if (exclusion.excluded) {
      return res.status(403).json({
        error: 'SELF_EXCLUDED',
        message: exclusion.message,
        until: exclusion.until,
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        kycStatus: user.kycStatus,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { refreshToken: null },
    });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Forgot password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const resetToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    await sendPasswordResetEmail(email, user.username, resetToken);
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Request failed' });
  }
});

// Reset password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// Resend verification
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) {
      return res.json({ message: 'If applicable, verification email sent.' });
    }

    const verifyToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    await sendVerificationEmail(email, user.username, verifyToken);
    res.json({ message: 'If applicable, verification email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send verification' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { wallet: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus,
      avatarUrl: user.avatarUrl,
      balanceCents: user.wallet?.balanceCents || 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;

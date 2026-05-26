import { prisma } from '../app.js';

// Jurisdictions where online gambling is prohibited or requires specific licensing
// This is a simplified list — production would use MaxMind GeoIP
const BLOCKED_REGIONS = [
  // US states without online gambling licensing (simplified)
  'US-UT', 'US-HI',
];

/**
 * Check if user is at least 18 years old.
 */
export function validateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
}

/**
 * Check self-exclusion status for a user.
 */
export async function checkSelfExclusion(userId) {
  const rg = await prisma.responsibleGambling.findUnique({
    where: { userId },
  });

  if (!rg?.exclusionUntil) return { excluded: false };

  const now = new Date();
  if (rg.exclusionUntil > now) {
    return {
      excluded: true,
      until: rg.exclusionUntil,
      message: 'Your account is temporarily excluded. Contact support for assistance.',
    };
  }

  return { excluded: false };
}

/**
 * Middleware: check self-exclusion on protected routes.
 */
export async function exclusionMiddleware(req, res, next) {
  if (!req.userId) return next();

  const result = await checkSelfExclusion(req.userId);
  if (result.excluded) {
    return res.status(403).json({
      error: 'SELF_EXCLUDED',
      message: result.message,
      until: result.until,
    });
  }
  next();
}

/**
 * Check daily deposit limit.
 */
export async function checkDepositLimit(userId, amountCents) {
  const rg = await prisma.responsibleGambling.findUnique({
    where: { userId },
  });

  if (!rg?.dailyDepositLimitCents) return { allowed: true };

  // Sum today's deposits
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysDeposits = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'DEPOSIT',
      createdAt: { gte: startOfDay },
    },
    _sum: { amountCents: true },
  });

  const totalToday = (todaysDeposits._sum.amountCents || 0) + amountCents;

  if (totalToday > rg.dailyDepositLimitCents) {
    return {
      allowed: false,
      limit: rg.dailyDepositLimitCents,
      used: todaysDeposits._sum.amountCents || 0,
      message: `Daily deposit limit of $${(rg.dailyDepositLimitCents / 100).toFixed(2)} would be exceeded.`,
    };
  }

  return { allowed: true };
}

/**
 * Compliance banner data for non-production environments.
 */
export function getComplianceBanner() {
  if (process.env.NODE_ENV === 'production') return null;
  return {
    type: 'warning',
    message: 'COMPLIANCE TODO: Real-money gambling requires jurisdiction-specific licensing. KYC/AML must be implemented before launch. Stripe may not permit gambling — verify merchant category. Consult a gaming attorney before going live.',
  };
}

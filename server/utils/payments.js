/**
 * Platform fee and seller earnings split for marketplace orders.
 */

export const getPlatformFeePercent = () => {
  const raw = Number(process.env.PLATFORM_FEE_PERCENT ?? 10);
  if (!Number.isFinite(raw) || raw < 0 || raw > 50) {
    return 10;
  }
  return raw;
};

export const roundMoney = (value) => Math.round(value * 100) / 100;

/**
 * @param {number} grossAmount Order total in USD
 */
export const calculateOrderSplit = (grossAmount) => {
  const gross = roundMoney(Number(grossAmount));
  const feePercent = getPlatformFeePercent();
  const platformFee = roundMoney((gross * feePercent) / 100);
  const sellerEarnings = roundMoney(gross - platformFee);

  return {
    gross,
    platformFee,
    sellerEarnings,
    feePercent,
  };
};

export const isValidPaypalEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

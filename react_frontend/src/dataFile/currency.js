
export const CURRENCY_SYMBOL = "₹";

export const formatCurrency = (amount) => `${CURRENCY_SYMBOL}${Number(amount || 0).toLocaleString("en-IN")}`;
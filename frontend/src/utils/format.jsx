/* =========================
   📅 DATE HELPERS
========================= */

export const calculateDays = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) return 0;

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diff = endDate - startDate;

  return diff >= 0
    ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
    : 0;
};

export const formatDate = (date, locale = 'en-IN') => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d)) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
};

export const formatDateTime = (date, locale = 'en-IN') => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d)) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

export const formatShortDate = (date, locale = 'en-IN') => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d)) return '-';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
};

export const getDayName = (date, locale = 'en-IN') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d)) return '';

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short'
  }).format(d);
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};


/* =========================
   💰 CURRENCY
========================= */

export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};


/* =========================
   🔐 SANITIZATION
========================= */

export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input.replace(/[<>]/g, '').trim();
};


/* =========================
   👤 USER HELPERS
========================= */

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';

  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};


/* =========================
   ✂️ TEXT HELPERS
========================= */

export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';

  return text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;
};
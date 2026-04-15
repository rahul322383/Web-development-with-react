
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};


// ======================
// 📅 DATE FORMAT
// ======================
export const formatDate = (date, locale = 'en-IN') => {
  if (!date) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};


// ======================
// 📅 DATE + TIME
// ======================
export const formatDateTime = (date, locale = 'en-IN') => {
  if (!date) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};


// ======================
// 👤 INITIALS
// ======================
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


// ======================
// ✂️ TRUNCATE TEXT
// ======================
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';

  return text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;
};
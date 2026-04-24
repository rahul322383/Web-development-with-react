const xss = require('xss');

const sanitize = (obj) => {
    if (typeof obj === 'string') {
        return xss(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }

    if (obj instanceof Date) {
        return obj;
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, sanitize(value)])
        );
    }

    return obj;
};

module.exports = sanitize;
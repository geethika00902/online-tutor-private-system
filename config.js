// Configuration using environment variables (with sensible defaults)
// Loads variables from a local .env file if present
try { require('dotenv').config(); } catch (_) {}

const toInteger = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
};

module.exports = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tutor_system',
        port: toInteger(process.env.DB_PORT, 3306)
    },
    server: {
        // PORT is a common env var name used by many hosts
        port: toInteger(process.env.PORT || process.env.SERVER_PORT, 3001)
    },
    policy: {
        // Minutes within which a session cannot be cancelled (24h default)
        cancelLockMinutes: toInteger(process.env.POLICY_CANCEL_LOCK_MINUTES, 24 * 60),
        // Max minutes a student can book per day (0 disables limit). Default 360 min = 6h
        maxDailyBookingMinutes: toInteger(process.env.POLICY_MAX_DAILY_BOOKING_MINUTES, 360)
    }
};

// Database Configuration
module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '', // XAMPP default has no password
        database: 'tutor_system',
        port: 3306
    },
    server: {
        port: 3001
    },
    policy: {
        // Minutes within which a session cannot be cancelled (24h default)
        cancelLockMinutes: 24 * 60,
        // Max minutes a student can book per day (0 disables limit). Default 360 min = 6h
        maxDailyBookingMinutes: 360
    }
};

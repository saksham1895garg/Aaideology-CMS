const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = (app) => {
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                ttl: 24 * 60 * 60, // Session TTL (1 day)
                autoRemove: 'native',
                touchAfter: 24 * 3600 // Only update session every 24 hours unless data changes
            }),
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }
        })
    );
};

module.exports = sessionConfig;

const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123123";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const customToken = req.headers.token;

    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    } else if (customToken) {
        token = customToken;
    }

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { authMiddleware };

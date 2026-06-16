// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware verifies JWT tokens and protects routes that require authentication
// Used on: POST /todo, DELETE /todo/:todoId, GET /todos

const jwt = require("jsonwebtoken");

// authMiddleware - Validates JWT token from request header
// If valid: extracts userId and attaches to req.userId for next middleware/endpoint
// If invalid: returns 403 error and stops request
// Usage: app.get("/todos", authMiddleware, (req, res) => { ... })
const authMiddleware = (req, res, next) => {
    // Extract token from Authorization header (format: "Bearer <token>")
    // OR from custom "token" header
    const authHeader = req.headers.authorization;
    const customToken = req.headers.token;
    
    // Get token: either from "Bearer <token>" format or custom token header
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7); // Remove "Bearer " prefix
    } else if (customToken) {
        token = customToken;
    }

    // Check if token exists
    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        });
    }

    try {
        // Verify token using same secret key used during signin
        // If valid, decode() returns the payload { userId: ... }
        const decoded = jwt.verify(token, "secret123123");
        
        // Attach userId to request object so endpoint can access it
        req.userId = decoded.userId;
        
        // Call next() to pass control to the next middleware/route handler
        next();
    } catch (error) {
        // Token is invalid or expired
        res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = {
    authMiddleware: authMiddleware
}
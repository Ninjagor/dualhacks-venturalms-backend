"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // id, msg, details (err)
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            id: '1001',
            message: 'Unauthorized (Handled in errorhandler)',
            details: err.stack
        });
    }
    if (err.name === 'ForbiddenError') {
        return res.status(403).json({ error: 'Forbidden (Handled in errorhandler)' });
    }
    // For other unexpected errors, return a generic error response.
    return res.status(500).json({ error: 'Internal Server Error' });
};
exports.default = errorHandler;

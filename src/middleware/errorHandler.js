// src/middleware/errorHandler.js

export default (err, req, res, next) => {
    console.error('Error:', err);
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
};
    
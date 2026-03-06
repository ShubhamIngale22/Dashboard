const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../constant/constant');

module.exports = {

    generateToken: (payload, expiry = JWT_EXPIRE || '1d') => {
        return jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: expiry }
        );
    },
    verifyToken: (token) => {
        return jwt.verify(token, JWT_SECRET);
    }
};

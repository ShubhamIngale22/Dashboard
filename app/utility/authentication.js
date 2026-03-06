const jwtHelper = require('../helpers/jwt_helper');
const response = require('./api_handler');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {  // ✅ check Bearer format
        return res.json(response.JsonMsg(false, null, 'Authorization token missing!', 401));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.json(response.JsonMsg(false, null, 'Invalid token format!', 401));
    }

    try {
        const decoded = jwtHelper.verifyToken(token);
        req.user = decoded;
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.json(response.JsonMsg(false, null, 'Token expired!', 401));
        }
        return res.json(response.JsonMsg(false, null, 'Invalid token!', 401));
    }
};

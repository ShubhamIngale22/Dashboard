const jwtHelper = require('../helpers/jwt_helper');
const response = require('./api_handler');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
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
        return res.json(response.JsonMsg(false, null, 'Invalid or expired token!', 401));
    }
};

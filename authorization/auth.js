var jwt = require('jsonwebtoken');

module.exports = {
    authorize: function (req, res, next) {
        var token = req.body.token;

        if (token) {
            jwt.verify(token, 'U@$kldskf*(13', function (err, decoded) {
                if (err) {
                    return res.json({success: false, message: 'Failed to authenticate token.'});
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }
}
var mongoose = require('mongoose');
var db = require('../config/db');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String},
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password)
{
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}
;

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
            __id: this.__id,
            username: this.username,
            exp: parseInt(expiry.getTime() / 1000)
        },
        "secret to be moved from here"
    );
};

mongoose.model('user', userSchema);

module.exports = mongoose;
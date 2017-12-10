var express = require('express');
var passport = require('passport');
var router = express.Router();
var user = require('../models/user');
var mongoOpt = require('../storageOperations/mongoOperations');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({type: 'application/*+json'});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.get('/addUser', jsonParser, function(req, res, next){
    mongoOpt.addUser(req, res);
});


router.post('/login', jsonParser, function (req, res) {
    mongoOpt.loginUser(req, res);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

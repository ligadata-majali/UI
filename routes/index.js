var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({type: 'application/*+json'});

var auth = require('../authorization/auth');

var mongoOpt = require('../storageOperations/mongoOperations');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/getAllModels', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.getAllModels(req.body.models, function (response) {
        res.send({models: response});
    });
});

router.post('/addModelMetaData', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.addModelMetaData(req.body.model, function (result) {
        res.send({result: result});
    });
});
router.post('/updateModel', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.updateModel(req.body.model, function (result) {
        res.send({result: result});
    });
});

router.post('/deleteModel', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.deleteModel(req.body.model, function (result) {
        res.send({result: result});
    });
});

router.post('/updateLastMinuteData', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.updateLastMinuteData(req.body.modelArrays, function (result) {
        res.send({result: result});
    });
});

router.post('/updateAlerts', jsonParser, auth.authorize, function (req, res, next) {
    mongoOpt.updateAlerts(req.body.models, function (result) {
        res.send({result: result});
    });
});

module.exports = router;

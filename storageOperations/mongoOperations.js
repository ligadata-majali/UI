var modelOpt = require('../models/model');
var userOpt = require('../models/user');
var _ = require("underscore");
var mongoose = require('mongoose');
var async = require('async');

var model = mongoose.model('model');
var User = mongoose.model('user');

var jwt = require('jsonwebtoken');

module.exports = {
    getAllModels: function (models, finalCallback) {
        try {
            if (models.length === 1 && models[0] == '') {
                finalCallback([]);
            }
            async.each(models, function (item, callback) {
                if (!item)
                    return;
                model.findOne({id: item.id}, function (err, obj) {
                    if (!obj && item) {
                        var newModel = new model();
                        newModel.id = item.id;
                        newModel.version = item.name.split('.')[item.name.split('.').length - 1];
                        newModel.name = item.name;
                        newModel.age = 0;
                        newModel.status = 'Active';

                        newModel.save(function (err, data) {
                            if (err) {
                                console.log('error in inserting new item.', err);
                            }
                            callback();
                        });
                    } else {
                        callback();
                    }
                });
            }, function (err) {
                async.waterfall([
                    function (callback) {
                        var modelsString = _.map(models, function (obj) {
                            return obj.name;
                        });
                        model.remove({id: {"$nin": modelsString}}, function (err, doc) {
                            callback(null);
                        });
                    }
                ], function (err) {
                    model.find(function (err, _models) {
                        finalCallback(_models);
                    });
                });
            });

        } catch (ex) {
            finalCallback({error: 'Error while getting new models ' + ex});
        }
    },
    addModelMetaData: function (modelObj, callback) {
        try {
            var newModel = new model();
            newModel.id = modelObj.id;
            newModel.name = modelObj.originalName;
            newModel.version = modelObj.version;
            newModel.projectName = modelObj.projectName;
            newModel.age = 0;
            newModel.status = modelObj.status;
            newModel.language = modelObj.language;
            newModel.createdAt = modelObj.createdAt;
            newModel.configName = modelObj.configName;
            newModel.save(function (error, data) {
                if (error) {
                    callback({error: "Error while adding model meta data: " + error});
                } else {
                    callback(data);
                }
            });
        } catch (ex) {
            callback({error: "Error while adding model meta data: " + ex});
        }

    },

    deleteModel: function (modelObj, callback) {
        try {
            model.remove({_id: modelObj._id}, function (err) {
                if (!err) {
                    callback({result: "Deleted successfully"});
                } else {
                    callback({error: "Error while Deleting: " + err});
                }
            });
        } catch (ex) {
            callback({error: "Error while deleting model: " + ex});
        }
    },

    updateModel: function (modelObj, callback) {
        var result = {};
        try {
            model.findById(modelObj._id, function (err, obj) {
                if (obj) {
                    //obj.age = modelObj.age;
                    obj.tags = modelObj.tags;
                    obj.description = modelObj.description;
                    if (modelObj.updatedName) {
                        obj.name = modelObj.updatedName;
                        obj.version = modelObj.updatedName.split('.')[modelObj.updatedName.split('.').length - 1];
                    }
                    obj.save(function (err, data) {
                        if (err) {
                            result.error = err;
                            console.log('Error in updated the model.');
                        } else {
                            result.success = data;
                        }
                        callback(result);
                    });
                }
            });
        } catch (ex) {
            callback({error: "Error while updating model info " + ex});
        }
    },
    updateLastMinuteData: function (modelArrays, callback) {
        var result = {};
        try {
            model.find({}, function (err, modelsObj) {
                modelsObj.forEach(function (model) {
                    model.lastMinute = modelArrays[model.id];
                    model.save(function (err, data) {
                        if (err) {
                            result.error = err;
                            console.log('Error while updating last minute', err);
                        } else {
                            //console.log('Last minute has been updated');
                            result.success = data;
                        }
                    });
                });
            });
            callback({result: 'updated last minute'});
        } catch (ex) {
            callback({error: "Error while setting last minute data " + ex});
        }
    },
    updateAlerts: function (modelArrays, callback) {
        console.log('update alerts mongo');
        var result = {};
        try {
            model.find({}, function (err, modelsObj) {
                modelsObj.forEach(function (model) {
                    try {
                        model.alerts = _.findWhere(modelArrays, {id: model.id}).alerts;
                        model.save(function (err, data) {
                            if (err) {
                                result.error = err;
                                console.log('Error while updating last minute', err);
                            } else {
                                //console.log('Last minute has been updated');
                                result.success = data;
                            }
                        });
                    }catch(ex){
                        console.log(ex);
                    }
                });
            });
            callback({result: 'updated last minute'});
        } catch (ex) {
            callback({error: "Error while setting last minute data " + ex});
        }
    },
    addUser: function (req, res) {
        var newUser = new User({
            username: 'demo',
            password: 'demo123'
        });

        newUser.save(function (err) {
            if (err) {
                throw err;
            }

            console.log('User saved successfully');
            return res.json({success: true});
        });
    },
    loginUser: function (req, res) {
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) {
                res.send(404).json(err);
                return;
            }

            if (!user) {
                res.json({success: false, message: 'Authentication failed. User not found.'})
            } else if (user) {
                if (user.password != req.body.password) {
                    res.json({success: false, message: 'Authentication failed. Wrong password.'})
                } else {
                    var expiryDate = new Date();
                    expiryDate = expiryDate.setMinutes(expiryDate.getMinutes() + 30);
                    var token = jwt.sign({username: user.username, password: user.password, exp: expiryDate}, 'U@$kldskf*(13', {

                    });

                    res.json({
                        success: true,
                        message: 'Successful login',
                        token: token
                    });
                }
            }

        });
        /*passport.authenticate('local', function (err, user, info) {
         var token;

         if (err) {
         res.send(404).json(err);
         return;
         }

         if (user) {
         token = user.generateJwt();
         res.status(200);
         res.json({
         "token": token
         });
         } else {
         // if user not found
         res.status(401).json(info)
         }
         })(req, res);
         */
    }
}

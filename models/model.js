var mongoose = require('mongoose');
var db = require('../config/db');

// connect to mongodb
mongoose.connect(db.mongodb.url);

var modelSchema = new mongoose.Schema({
    id: {type: Number, unique: true, required: true},
    name: {type: String, required: true},
    description: {type: String, default: ''},
    tags: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now},
    age: {type: Number},
    status: {type: String, default: ''},
    percentage: {type: Number, default: 3},
    language: {type: String, default: 'scala'},
    projectName: {type: String, default: 'User Behavior'},
    configName: {type: String, default: ''},
    version: {type: String, default: ''},
    lastMinute: [],
    alerts: []
});

mongoose.model('model', modelSchema);

module.exports = mongoose;

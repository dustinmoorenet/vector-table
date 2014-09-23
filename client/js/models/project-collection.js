// project Collection - project-collection.js
var AmpCollection = require('ampersand-rest-collection');
var project = require('./project');


module.exports = AmpCollection.extend({
    model: project,
    url: '/api/project'
});
var View = require('../views/view');
var _ = require('lodash');

module.exports = View.extend({
    events: {
        'tap g': 'tap',
    },
    autoRender: true,
    template: function(context) {
        context._element = context._parentElement.group();

        return context._element.node;
    },
    initialize: function(options) {
        this._meta = options.object;
        this._parentElement = options.parentElement;
    },
    render: function() {
        this.renderWithTemplate(this);

        if (this.rect) {
            return this;
        }

        var object = this._meta;
        this.rect = this._element.rect(object.attr.width, object.attr.height);
        this.id = object.id = _.uniqueId('obj-');

        this.rect.attr('id', object.id);
        this.rect.move(object.attr.x, object.attr.y);

        var handles = {};
        object.handles.forEach(function(handle) {
            var circle = this._element.circle(handle.attr.r * 2);

            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
            circle.fill('red');
            circle.attr('id', object.id + '-' + handle.id);

            handles[handle.id] = circle;
        }, this);

        this._handles = handles;

        return this;
    },
    transform: function(object) {
        this.rect.move(object.attr.x, object.attr.y);
        this.rect.size(object.attr.width, object.attr.height);
        this._meta = object;

        object.handles.forEach(function(handle) {
            var circle = this._handles[handle.id];
            circle.attr('cx', handle.attr.cx);
            circle.attr('cy', handle.attr.cy);
        }, this);
    },
    tap: function() {
        console.log('selected!!!');
    }
});

var View = require('../views/view');
var _ = require('lodash');

module.exports = View.extend({
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

        if (this.polygon) {
            return this;
        }

        var object = this._meta;
        var position = object.attr.path[object.attr.path.length - 1];
        this.polygon = this._element.polygon([position]).fill('none').stroke({width: 1});
        this.id = object.id = _.uniqueId('obj-');

        var handles = {};
        var handle = object.handles[0];
        var circle = this._element.circle(handle.attr.r * 2);

        circle.attr('cx', handle.attr.cx);
        circle.attr('cy', handle.attr.cy);
        circle.fill('red');
        circle.attr('id', object.id + '-' + handle.id);

        handles[handle.id] = circle;

        this._handles = handles;

        return this;
    },
    transform: function(object) {
        //FIXME this is not transforming a poloygon this is adding to
        this._meta = object;
        var position = object.attr.path[object.attr.path.length - 1];

        var array = this.polygon._array.value;

        array.push(position);

        this.polygon.plot(array);

        var handle = object.handles[object.handles.length - 1];
        var circle = this._element.circle(handle.attr.r * 2);

        circle.attr('cx', handle.attr.cx);
        circle.attr('cy', handle.attr.cy);
        circle.fill('red');
        circle.attr('id', object.id + '-' + handle.id);

        this._handles[handle.id] = circle;
    }
});

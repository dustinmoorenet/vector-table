import Element from './Element';

export default class Polygon extends Element {
    createElement(options) {
        this._element = options.parentElement.path('M0,0');

        super.createElement({el: this._element.node});
    }

    render(shape) {
        super.render(shape);

        if (!shape) { return; }

        this.applyD(shape.d);

        if (shape.id) {
            global.app.user.projectStore.boundingBoxes.set(shape.id, this.el.getBoundingClientRect());
        }
    }

    applyD(d=[]) {
        var newD = [];

        for (var i = 0; i < d.length; i++) {
            var move = d[i].slice(0);
            var type = move.shift();

            newD.push(type + move.join(','));
        }

        newD = newD.join(' ');

        this.setAttribute('d', newD);
    }
}

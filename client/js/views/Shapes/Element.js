import View from '../View';

const FUNCTION_FROM_TYPE = {
    unknown: 0,
    matrix: 'setMatrix',
    translate: 'setTranslate',
    scale: 'setScale',
    rotate: 'setRotate',
    skewx: 'setSkewX',
    skewy: 'setSkewY'
};

export default class Element extends View {
    constructor(options) {
        super(options);

        this.rootSVG = this._element.doc().node;
    }
    render(shape) {
        if (!shape) {
            this.remove();

            return;
        }

        this.setAttribute('id', shape.id);
        this.setAttribute('data-for-item', shape.forItem);
        this.setAttribute('fill', shape.fill);
        this.setAttribute('stroke', shape.stroke);
        this.setAttribute('stroke-linecap', shape['stroke-linecap']);
        this.setAttribute('stroke-width', shape['stroke-width']);

        this.applyTransform(shape.transform);

        if (shape.id) {
            this.el.classList.add('item');
        }
    }

    applyTransform(newTransformList=[]) {
        var realTransformList = this.el.transform.baseVal;

        realTransformList.clear();

        for (var i = 0; i < newTransformList.length; i++) {
            var type = newTransformList[i][0];
            var args = newTransformList[i].slice(1);
            var transform = this.rootSVG.createSVGTransform();

            var setFunction = FUNCTION_FROM_TYPE[type];

            if (!setFunction) {
                throw new Error(`Can not call unknown transform type: ${type}`);
            }

            transform[setFunction].apply(transform, args);

            realTransformList.appendItem(transform);
        }

        // This seems like a bug in chrome. Transform is not really cleared
        // unless something is there. Just awful.
        if (realTransformList.length === 0) {
            this.setAttribute('transform', 'translate(0 0)');
        }
    }
}

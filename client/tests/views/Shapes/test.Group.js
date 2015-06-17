import expect from 'expect';
import _ from 'lodash';
import Shapes from '../../../js/views/Shapes';
import SVG from '../../../js/libs/svg';

var shape = {
    type: 'Group',
    nodes: [
        {type: 'Rectangle', x: 23, y: 45, width: 345, height: 123},
        {type: 'Ellipse', cx: 12, cy: 34, rx: 10, ry: 12}
    ]
};

describe('Shape.Group', () => {
    var group;
    var svg;

    beforeEach(() => {
        svg = new SVG(document.querySelector('body'));
        group = new Shapes.Group({parentElement: svg});
    });

    afterEach(() => {
        svg.node.parentNode.removeChild(svg.node);
    });

    it('should create a group element', () => {
        expect(group.el).toBeAn(SVGGElement);
    });

    it('should contain the correct elements', () => {
        group.render(shape);

        expect(group.el.outerHTML).toBe('<g><rect width="345" height="123" x="23" y="45"></rect><ellipse rx="10" ry="12" cx="12" cy="34"></ellipse></g>');
    });

    it('should rebuild when elements change', () => {
        shape = _.cloneDeep(shape);

        group.render(shape);

        expect(group.el.outerHTML).toBe('<g><rect width="345" height="123" x="23" y="45"></rect><ellipse rx="10" ry="12" cx="12" cy="34"></ellipse></g>');

        shape.nodes.pop();

        group.render(shape);

        expect(group.el.outerHTML).toBe('<g><rect width="345" height="123" x="23" y="45"></rect></g>');
    });
});

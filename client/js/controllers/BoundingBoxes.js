import Events from '../libs/Events';

export default class BoundingBoxes extends Events {
    constructor() {
        super();

        this.boxes = {};
    }

    set rootOffset(box) {
        this._ro = {
            x: box.left,
            y: box.top
        };
    }

    get rootOffset() {
        return this._ro;
    }

    get(itemID) {
        return this.boxes[itemID];
    }

    set(itemID, box) {
        this.boxes[itemID] = {
            x: box.left - this.rootOffset.x,
            y: box.top - this.rootOffset.y,
            width: box.width,
            height: box.height
        };
    }
}

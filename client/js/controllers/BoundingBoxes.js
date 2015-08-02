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
        return new Promise((resolve) => {
            if (itemID in this.boxes) {
                resolve(this.boxes[itemID]);
            }
            else {
                this.once(itemID, (box) => {
                    resolve(box);
                });
            }
        });
    }

    set(itemID, box) {
        this.boxes[itemID] = {
            x: box.left - this.rootOffset.x,
            y: box.top - this.rootOffset.y,
            width: box.width,
            height: box.height
        };

        this.trigger(itemID, this.boxes[itemID]);
    }
}

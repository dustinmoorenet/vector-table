import _ from 'lodash';
import Events from '../libs/Events';

/*
The timeLine is an array that contains all items at each point in time. The array
is just as long as there are frames in the scene.

frame and item objects can be shared to minimize object counts

Any changes to the timeline cause objects to be cloned

each frame has a frame number that it as created on so that when a frame is changed
we know to update all frames after it upto a point that the frame number is different

The timeLine is generated from the dataStore.

item = {
    timeLine: {
        0: { shape info },
        5: { shape info }
    }
}

frames = [
    [ // layers
        [ // layer contains items
            { // item
                frame: 1,
                id: i1,
                shapes: [
                    { circle },
                    { rectangle }
                ]
            },
            { // item
                frame: 1,
                id: i2
                shapes: [
                    { circle },
                    { rectangle }
                ]
            }
        ],
        [ // layer contains items
            { // item
                frame: 1,
                id: i3,
                shapes: [
                    { circle },
                    { rectangle }
                ]
            }
        ]
    ]
]


Add group tool and remove layer concept
build from the group down?
it should render the disposition of all items in the frame

g
 e
 p
 g
  r
  r
  r
  g
   e
  r
 p
 p
e
g
 p

An item contains shapes (groups, polygons, rectangles, ...) but a shape does not
have to be an item. The item designation is just a marker for reference

maintain an array of frames with that can lookup the items by ID
*/

export default class TimeLine extends Events {
    constructor() {
        super();

        this.frames = [];
        this.frames.length = 100;

        this.listenTo(global.dataStore, 'all', this.onItemChanged);
    }

    buildFrames() {
        var root = global.dataStore.get('0000');
        this.nodeIndex = {};

        this.buildNode(root);
    }

// if we have to make a change clone the object
// build/rebuild the timeLine forward from any point
// items are always referenced in the nodes of an item so addressing is easy (parent and node position)

// only called when initially building frame tree and when a node has been updated
// if node object passed in contains a frameNumber lower than current frame pull from cache (repeat)
// One node does not depend on another node so each can be built independently
// don't fill in references, all we need to do is expand the objects on the timeLine
// So the timeline is just an array of time with each frame being an object of
// ID keys and fully materialized items. The items have id strings as references
// or none IDed items
// Items must always exist in time, so not having a timeLine is not an option
// Being able to delete a node from a point in time allows items to be recycled
// in a particle system
    buildNode(node, startFrame=0) {
        this.nodeIndex[node.id] = node;
        var timeLine = node.timeLine;

        delete node.timeLine;

        var previousFrame;
        var thisFrame;
        for (var i = startFrame; timeLine && i < this.frames.length; i++) {
            thisFrame = timeLine.find((frame) => frame.frame === i);

            // Item does not exists yet on timeline
            if (!previousFrame && !thisFrame) { continue; }

            // This frame is a repeat of the previous frame
            if (!thisFrame) {
                thisFrame = previousFrame;
            }
            // This frame has changes, build off previous frame or base node
            else {
                _.defaults(thisFrame, previousFrame || node);
            }

            this.frames[i] = this.frames[i] || {};
            this.frames[i][thisFrame.id] = previousFrame = thisFrame;

            var childNode;
            var childID;
            for (var n = 0; thisFrame.nodes && n < thisFrame.nodes.length; n++) {
                childNode = thisFrame.nodes[n];
                childID = typeof childNode === 'string' ? childNode : undefined;

                // No need to build it twice
                if (this.nodeIndex[childID]) { continue; }

                if (childID) {
                    childNode = global.dataStore.get(childID);
                }

                // Follow the rabbit
                this.buildNode(childNode);
            }
        }
    }

    buildLayer(layerID) {
        var layer = global.dataStore.get(layerID);

        if (!layer || !layer.items) { return; }

        layer.items.reduce(this.buildItem.bind(this), []);
    }

    buildItem(items, itemID) {
        // build the whole item time line in here
        var item = global.dataStore.get(itemID);

        if (!item || !item.timeLine) { return; }


    }

    onItemChanged() {

    }
}

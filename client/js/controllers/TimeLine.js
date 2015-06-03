import _ from 'lodash';
import Events from '../libs/Events';

export default class TimeLine extends Events {
    constructor(options={}) {
        super();

        this.itemStore = options.itemStore;
        this.rootID = options.rootID;

        this.frames = [];
        this.frames.length = 100;
    }

    buildFrames() {
        var root = this.itemStore.get(this.rootID);
        this.nodeIndex = {};

        this.buildNode(root);
    }

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
                    childNode = this.itemStore.get(childID);
                }

                // Follow the rabbit
                this.buildNode(childNode);
            }
        }
    }
}

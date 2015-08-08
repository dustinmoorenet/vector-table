import _ from 'lodash';
import Events from '../libs/Events';

/*
Time line needs to:
* Maintain item states in all frames from dataStore changes
* Inform a renderer of item state changes
* Drive a renderer through the time line at a given speed

*/
export default class TimeLine extends Events {
    constructor(options={}) {
        super();

        this.itemStore = options.itemStore;
        this.rootID = options.rootID;
        this._currentFrame = 0;
        this.repeat = false;
        this.msBetweenFrames = 1000 / 24;
        this.frames = [];
        this.frameCount = options.frameCount || 100;

        this.listenTo(this.itemStore, 'all', this.onItemChanged);
    }

    get frameCount() {
        return this.frames.length;
    }

    set frameCount(frameCount) {
        var oldFrameCount = this.frames.length;

        this.frames.length = frameCount;

        if (oldFrameCount < frameCount) {
            this.buildFrames(oldFrameCount);
        }
    }

    get currentFrame() {
        return this._currentFrame;
    }

    set currentFrame(frame) {
        if (this._currentFrame === frame) { return; }

        this._currentFrame = frame;

        var items = this.frames[this._currentFrame];

        for (var id in items) {
            this.trigger(id, items[id]);
        }

        this.trigger('currentFrame', frame);
    }

    get(id) {
        return this.frames[this._currentFrame][id];
    }

    onItemChanged(id, item) {
        this.buildNode(item);

        this.trigger(id, this.get(id));
    }

    buildFrames(startFrame=0) {
        this.nodeIndex = {};

        var root = this.itemStore.get(this.rootID);

        this.buildNode(root, startFrame);
    }

    buildNode(node, startFrame=0) {
        if (!node) { return; }

        this.nodeIndex[node.id] = node;
        var timeLine = node.timeLine;

        delete node.timeLine;

        var previousFrame;
        var thisFrame;
        for (var i = startFrame; timeLine && i < this.frameCount; i++) {
            thisFrame = timeLine.find((frame) => frame.frame === i);

            // Item does not exists yet on timeline
            if (!previousFrame && !thisFrame) {
                thisFrame = null;
            }
            // This frame is a repeat of the previous frame
            else if (!thisFrame) {
                thisFrame = previousFrame;
            }
            // This frame has changes, build off previous frame or base node
            else {
                _.defaults(thisFrame, previousFrame || node);
            }

            this.frames[i] = this.frames[i] || {};
            this.frames[i][node.id] = previousFrame = thisFrame;

            var childNode;
            var childID;
            for (var n = 0; thisFrame && thisFrame.nodes && n < thisFrame.nodes.length; n++) {
                childNode = thisFrame.nodes[n];
                childID = typeof childNode === 'string' ? childNode : undefined;

                // No need to build it twice
                if (this.nodeIndex[childID]) { continue; }

                if (childID) {
                    childNode = this.itemStore.get(childID);
                }

                // Follow the rabbit
                this.buildNode(childNode, startFrame);
            }
        }
    }

    play(startFrame=0, repeat=false) {
        this.startTime = +(new Date());
        this.startFrame = startFrame;
        this.repeat = repeat;

        this.continuePlay(startFrame);

        this.saveSelection();
    }

    continuePlay(frame) {
        this.currentFrame = frame;

        if (this.stopFlag) {
            delete this.stopFlag;

            this.restoreSelection();

            return;
        }

        setTimeout(() => {
            var now = +(new Date());
            var frameCount = this.frames.length;
            var advanceCount = Math.ceil((now - this.startTime) / this.msBetweenFrames);
            var nextFrame = this.startFrame + advanceCount;

            if (this.repeat) {
                nextFrame %= frameCount;
            }
            else if (nextFrame >= frameCount) {
                nextFrame = frameCount - 1;

                this.stopFlag = true;
            }

            this.continuePlay(nextFrame);
        }, this.msBetweenFrames);
    }

    stop() {
        this.stopFlag = true;
    }

    saveSelection() {
        var app = global.appStore.get('app');
        this.savedSelection = global.dataStore.getProjectMeta(app.projectID, 'selection');

        global.app.sendWork({
            message: 'select',
            packageName: app.currentPackage,
            selection: []
        });
    }

    restoreSelection() {
        var app = global.appStore.get('app');

        global.app.sendWork({
            message: 'select',
            selection: this.savedSelection || [],
            packageName: app.currentPackage
        });
    }
}

import View from '../View';

/*
Each item is responsible for it's time line
Store position information in an array.
The array contains an object.
That object contains state information plus the frame number
each time a render on the table happens it looks up the position from project.currentFrame
It moves backwards through each item timeline looking for a frame number that is
equal to or less than the currentFrame. If no frame is found the item is not added

The time should be played up to the currentFrame so that each item can be drawn

The timeline will need to be managed by the packages that create/modify the item
A new frame will have to be spliced into the array at the correct position
*/

/*
or

There is a central timeline of all item versions
It is an array of objects
Each object contains a frame number and the ids of the items changed in that frame

Each item in the dataStore is the currentFrame version of that item

Need to separate out the history stuff from dataStore. There are too many cases
where setting the history is not correct. Like here when dataStore will be updated
every time the timeline moves. Then how do we handle the syncing out information?

Maybe there needs to be a central observable object for rendering and that is
where the currentFrame items are.

The packages are fed the currentFrame items for modification. The packages put the
modified items back in the dataStore. This should allow a particle system to emit
items that contain a timeline. Hmm. The packages need to be given a single item
on the timeline and also the complete item with a complete timeline. Certain
packages manage time and others do not.

The dataStore compiles the currentFrame items when an item change occurs.



The renderStore is just an object
indexed by the item ID and contains current time/shape information.

We generate the renderStore from the timeLine.

The timeLine is an array that contains all items at each point in time. The array
is just as long as there are frames in the scene.

The timeLine is generated from the dataStore.

The dataStore contains all the items with all the time/shape information. This
get stored and synced
*/
export default class TimeLine extends View {
    get template() { return require('./index.html'); }

    get events() {
        return {
            //'[type="text"] change': 'onText',
            //'[type="range"] change': 'onSlide'
        };
    }

    constructor(options) {
        super(options);

        this.projectID = options.projectID;

        this.listenTo(global.dataStore, this.projectID, this.render);

        this.render(global.dataStore.get(this.projectID));
    }

    render(project) {
        if (!this.built) {
            super.render();

            this.slider = this.el.querySelector('[type="range"]');
            this.input = this.el.querySelector('[type="text"]');

            this.input.addEventListener('change', () => this.onText());
            this.slider.addEventListener('change', () => this.onSlide());

            this.built = true;
        }

        if (!project) { return; }

        this.slider.value = this.input.value = project.currentFrame || 0;
    }

    onText() {
        this.setFrame(+this.input.value || 0);
    }

    onSlide() {
        this.setFrame(+this.slider.value || 0);
    }

    setFrame(frame) {
        var project = global.dataStore.get(this.projectID);

        if (!project) { return; }

        if (frame !== project.currentFrame) {
            project.currentFrame = frame;

            global.dataStore.set(this.projectID, project);
        }
    }
}

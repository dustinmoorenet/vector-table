import Modal from '../../Modal';
import FillPanel from './FillPanel';

export default class FillModal extends Modal {
    constructor(options) {
        super(options);

        this.object = options.object;
    }

    render() {
        super.render();

        this.views.panel = new FillPanel({
            el: this.el.querySelector('.container'),
            object: this.object
        });

        this.views.panel.render();
    }
}

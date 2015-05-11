import Modal from '../../Modal';
import FillPanel from './FillPanel';

export default class FillModal extends Modal {
    initialize(options) {
        this.object = options.object;
    }

    render() {
        this.renderWithTemplate();

        this.renderSubview(new FillPanel({object: this.object}), '.container');
    }
}

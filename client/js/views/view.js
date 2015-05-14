import AmpersandView from 'ampersand-view';

export default AmpersandView.extend({});

import Events from '../libs/Events';

export class NewView extends Events {
    get template() { return ''; }

    get events() { return {}; }

    constructor(options={}) {
        super();

        this.createElement(options);

        this.views = {};
    }

    createElement(options) {
        this.el = options.el || document.createElement('div');
    }

    render() {
        var template = this.template;

        var newDOM = template.call ? template() : template;

        if (!newDOM.appendChild) {
            var div = document.createElement('div');

            div.innerHTML = newDOM;

            newDOM = div.children[0];
        }

        var parent = this.el.parentNode;

        if (parent) {
            parent.replaceChild(newDOM, this.el);
        }

        if (newDOM.nodeName === '#document-fragment') {
            throw new Error('Views can only have one root element.');
        }

        this.el = newDOM;
    }

    remove() {
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }

        Object.keys(this.views).forEach((view) => this.views[view].remove());

        this.stopListening();

        this.trigger('remove', this);
    }
}

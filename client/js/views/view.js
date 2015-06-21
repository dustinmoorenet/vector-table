import Events from '../libs/Events';
import delegateEvents from 'events-mixin';

export default class View extends Events {
    get template() { return ''; }

    get events() { return {}; }

    constructor(options={}) {
        super();

        this.createElement(options);

        this.views = {};
    }

    createElement(options) {
        this.el = options.el || document.createElement('div');

        this.delegateEvents();
    }

    render() {
        var newDOM = this.template;

        if (newDOM) {
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

        this.delegateEvents();
    }

    remove() {
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }

        Object.keys(this.views).forEach((view) => this.views[view].remove());

        this.stopListening();

        this.trigger('remove', this);
    }

    delegateEvents() {
        if (this.eventManager) {
            this.eventManager.unbind();
        }

        this.eventManager = delegateEvents(this.el, this);

        var events = this.events;

        for (var key in events) {
            this.eventManager.bind(key, events[key]);
        }

    }

    setAttribute(attribute, value) {
        if (value === undefined || value === null || value !== value) {
            this.el.removeAttribute(attribute);
        }
        else {
            this.el.setAttribute(attribute, value.toString());
        }
    }
}

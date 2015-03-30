var fs = require('fs');
var View = require('../view');
var Properties = require('./Properties');

module.exports = View.extend({
    template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
    initialize: function(options) {
        this.packageControl = options.packageControl;

        this.listenTo(global.dataStore, 'selection', this.selectionChanged);

        this.selectionChanged(global.dataStore.get('selection'));
    },
    render: function(boundItem) {
        if (!this.el) {
            this.renderWithTemplate(this);

            this.propertyViews = this.packageControl.properties.map(this.renderProperty, this);

            this.title = this.query('[data-hook="title"]');
        }

        this.title.innerHTML = this.packageControl.title;

        this.propertyViews.forEach(function(view) {
            view.render(boundItem);
        });
    },
    renderProperty: function(property) {
        var Property = Properties[property.type];

        if (!Property) {
            return;
        }

        return this.renderSubview(new Property({config: property}), '[data-hook="properties"]');
    },
    selectionChanged: function(selection, previous) {
        if (this.boundItemId) {
            this.stopListening(global.dataStore, this.boundItemId);
        }

        this.boundItemId = (selection || [])[0];

        var boundItem;
        if (this.boundItemId) {
            this.listenTo(global.dataStore, this.boundItemId, this.render);

            boundItem = global.dataStore.get(this.boundItemId);
        }

        this.render(boundItem);
    }
});

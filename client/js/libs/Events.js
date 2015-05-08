import AmpersandEvents from 'ampersand-events';
import _ from 'lodash';

function Events() { }

_.extend(Events.prototype, AmpersandEvents);

export default Events;

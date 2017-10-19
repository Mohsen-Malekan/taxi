/**
 * Ride model events
 */

'use strict';

import {EventEmitter} from 'events';
let RideEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RideEvents.setMaxListeners(0);

// Model events
let events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Ride) {
  for(let e in events) {
    let event = events[e];
    Ride.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    // RideEvents.emit(event + ':' + doc._id, doc);
    RideEvents.emit(`${event}:${doc._id}`, doc);
    RideEvents.emit(event, doc);
  };
}

export {registerEvents};
export default RideEvents;

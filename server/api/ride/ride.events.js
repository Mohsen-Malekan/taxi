/**
 * Ride model events
 */

'use strict';

import {EventEmitter} from 'events';
var RideEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RideEvents.setMaxListeners(0);

// Model events
var events = {
  save   : 'save',
  remove : 'remove'
};

// Register the event emitter to the model events
function registerEvents(Ride) {
  for(var e in events) {
    let event = events[e];
    Ride.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    RideEvents.emit(event + ':' + doc._id, doc);
    RideEvents.emit(event, doc);
  };
}

export {registerEvents};
export default RideEvents;

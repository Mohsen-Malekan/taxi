/**
 * Favorite model events
 */

'use strict';

import {EventEmitter} from 'events';
let FavoriteEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
FavoriteEvents.setMaxListeners(0);

// Model events
let events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Favorite) {
  for(let e in events) {
    let event = events[e];
    Favorite.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    // FavoriteEvents.emit(event + ':' + doc._id, doc);
    FavoriteEvents.emit(`${event}:${doc._id}`, doc);
    FavoriteEvents.emit(event, doc);
  };
}

export {registerEvents};
export default FavoriteEvents;

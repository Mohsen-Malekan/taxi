/**
 * Broadcast updates to client when the model changes
 */

'use strict';

import RideEvents from './ride.events';

// Model events to emit
var events = ['save', 'remove'];

export function register(socket, io) {
  socket.on('CALL', data => {
    console.log('CALL> ', data);
    // socket.broadcast.emit('CALL_BACK', 'server');
    io.sockets.emit('CALL_BACK', 'server');
  });

  // Bind model events to socket events
  for(var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener(`ride:${event}`, socket);

    RideEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
}

function createListener(event, socket) {
  return function(doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
    RideEvents.removeListener(event, listener);
  };
}

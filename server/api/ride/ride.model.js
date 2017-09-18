'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './ride.events';

let RideSchema = new mongoose.Schema({
  userId        : String,
  driverId      : String,
  srcLoc        : {},
  destinations  : [{}],
  distance      : {},
  arrivedAt     : Date,
  startAt       : Date,
  finishedAt    : Date,
  duration      : Number,
  cost          : Number,
  paymentMethod : String,
  rate          : Number,
  description   : String,
  isDone        : Boolean,
  status        : String
});

registerEvents(RideSchema);
export default mongoose.model('Ride', RideSchema);

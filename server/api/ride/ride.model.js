'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './ride.events';

let RideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  srcLoc: {},
  destinations: [{}],
  distance: {},
  date: Date,
  arrivedAt: Date,
  startAt: Date,
  finishedAt: Date,
  duration: Number,
  cost: Number,
  paymentMethod: String,
  rate: Number,
  description: String,
  status: String,
  isOpen: {
    type: Boolean,
    default: false
  },
  isSettled: Boolean
});

registerEvents(RideSchema);
export default mongoose.model('Ride', RideSchema);

'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './ride.events';
import shared from '../../config/environment/shared';

let SettlementSchema = new mongoose.Schema({
  date : Date
});

let RideSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref  : 'User'
  },
  driver : {
    type : mongoose.Schema.Types.ObjectId,
    ref  : 'User'
  },
  src           : {},
  destinations  : [{}],
  distance      : {},
  date          : Date,
  arrivedAt     : Date,
  startAt       : Date,
  finishedAt    : Date,
  duration      : Number,
  cost          : Number,
  paymentMethod : String,
  rate          : Number,
  description   : String,
  status        : {
    type    : String,
    default : shared.rideStatus[0],
    enum    : shared.rideStatus
  },
  isSettled : {
    type    : Boolean,
    default : false
  }
});

registerEvents(RideSchema);
let Settlement = mongoose.model('Settlement', SettlementSchema);
export {Settlement};
export default mongoose.model('Ride', RideSchema);

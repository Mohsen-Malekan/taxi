'use strict';
/*eslint no-invalid-this:0*/

import mongoose from 'mongoose';
import {registerEvents} from './ride.events';
import shared from '../../config/environment/shared';
import User from '../user/user.model';

let SettlementSchema = new mongoose.Schema({
  date: Date
});

let RideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  srcLat: Number,
  srcLng: Number,
  destinations: [{}],
  distance: Number,
  date: {
    type: Date,
    default: Date.now()
  },
  arrivedAt: Date,
  startAt: Date,
  finishedAt: Date,
  duration: Number,
  cost: Number,
  paymentMethod: String,
  rate: {
    type: Number,
    min: 0,
    max: 10,
    default: 10
  },
  description: {
    type: String,
    maxlength: [200, 'تعداد کاراکترهای وارد شده، بیش از حد مجاز ({MAXLENGTH}) است.']
  },
  status: {
    type: String,
    default: shared.rideStatus[0],
    enum: shared.rideStatus
  },
  isSettled: {
    type: Boolean,
    default: false
  }
});

/**
 * Pre-save hook
 */
RideSchema
  .pre('save', function(next) {
    // Handle update rates
    if(!this.isModified('rate')) {
      let rideRate = this.rate;
      return User.findById(this.driver).exec()
        .then(driver => {
          driver.rate = (driver.rate + rideRate) / 2;
          return driver.save().then(() => next());
        });
    }
    return next();
  });

registerEvents(RideSchema);
let Settlement = mongoose.model('Settlement', SettlementSchema);
export {Settlement};
export default mongoose.model('Ride', RideSchema);

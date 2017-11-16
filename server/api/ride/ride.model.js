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
  src: {
    name: String,
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    }
  },
  loc: {
    name: String,
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    }
  },
  des: [{
    name: String,
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    }
  }],
  distance: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: new Date()
  },
  arrivedAt: {
    type: Date,
    default: null
  },
  startAt: {
    type: Date,
    default: null
  },
  finishedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  stoppageTime: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: shared.paymentMethods.cash
  },
  rate: {
    type: Number,
    min: 0,
    max: 10,
    default: 10
  },
  customerRate: {
    type: Number,
    min: 0,
    max: 10,
    default: 10
  },
  description: {
    type: String,
    maxlength: [200, 'تعداد کاراکترهای وارد شده، بیش از حد مجاز ({MAXLENGTH}) است.'],
    default: ''
  },
  discontentType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: shared.rideStatus.searching
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  subscribers: {
    type: Array,
    default: []
  },
  rejections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

/**
 * Pre-save hook
 */
RideSchema
  .pre('save', function(next) {
    // Handle update rates
    if(this.isModified('rate')) {
      let rideRate = this.rate;
      return User.findById(this.driver).exec()
        .then(driver => {
          driver.rate = (driver.rate + rideRate) / 2;
          return driver.save().then(() => next());
        });
    }
    if(this.isModified('customerRate')) {
      let customerRate = this.customerRate;
      return User.findById(this.user).exec()
        .then(user => {
          user.rate = (user.rate + customerRate) / 2;
          return user.save().then(() => next());
        });
    }
    return next();
  });

RideSchema
  .pre('save', function(next) {
    // Handle update rates
    if(this.isModified('status')) {
      if(this.status === shared.rideStatus.onTheWay) {
        return User.findByIdAndUpdate(this.driver, {driverState: shared.driverStates.riding}).exec()
          .then(() => next());
      } else if(this.status === shared.driverStates.waiting) {
        this.arrivedAt = new Date();
        return next();
      } else if(this.status === shared.driverStates.inProgress) {
        this.startAt = new Date();
        return next();
      } else if(this.status === shared.rideStatus.finished || this.status === shared.rideStatus.cancelledByUser || this.status === shared.rideStatus.cancelledByDriver) {
        this.finishedAt = new Date();
        this.duration = this.finishedAt - this.startAt;
        return User.findByIdAndUpdate(this.driver, {
          driverState: shared.driverStates.on,
          ride: null
        }).exec()
          .then(() => User.findByIdAndUpdate(this.user, {ride: null}).exec()
            .then(() => next()));
      }
    }
    return next();
  });

registerEvents(RideSchema);
let Settlement = mongoose.model('Settlement', SettlementSchema);
export {Settlement};
export default mongoose.model('Ride', RideSchema);

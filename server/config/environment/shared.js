'use strict';

exports = module.exports = {
  userRoles: ['guest', 'user', 'customer', 'driver', 'admin', 'sysAdmin'],
  rideStatus: {
    searching: 'searching',
    onTheWay: 'onTheWay',
    waiting: 'waiting',
    inProgress: 'inProgress',
    finished: 'finished',
    cancelledByUser: 'cancelledByUser',
    cancelledByDriver: 'cancelledByDriver'
  },
  paymentMethods: {
    cash: 'cash',
    credit: 'credit'
  },
  userFields: [
    'id',
    'name',
    'email',
    'mobile',
    'nationalCode',
    'accountNumber',
    'role',
    'date',
    'asset',
    'rate',
    'active',
    'driverState',
    'appId',
    'location',
    'sharingCode',
    'challengerCode',
    'lastState'
  ],
  driverStates: {
    on: 'on',
    off: 'off',
    riding: 'riding'
  },
  notificationKeys: {
    msg: 'msg',
    info: 'info',
    success: 'success',
    warn: 'warn',
    error: 'error',
    gift: 'gift',
    rideRequest: 'rideRequest',
    rideCancelledByUser: 'rideCancelledByUser',
    rideCancelledByDriver: 'rideCancelledByDriver',
    rideFinished: 'rideFinished',
    driverFound: 'driverFound',
    arrivedDriver: 'arrivedDriver',
  }
};

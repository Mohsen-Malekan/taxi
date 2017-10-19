'use strict';

exports = module.exports = {
  userRoles: ['guest', 'user', 'customer', 'driver', 'admin', 'sysAdmin'],
  rideStatus: ['searching', 'onTheWay', 'waiting', 'inProgress', 'finished', 'cancelledByUser', 'cancelledByDriver'],
  paymentMethods: ['cash', 'credit'],
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
  driverStates: ['on', 'off', 'riding']
};

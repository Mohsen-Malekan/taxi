/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/rides              ->  index
 * POST    /api/rides              ->  create
 * GET     /api/rides/:id          ->  show
 * PUT     /api/rides/:id          ->  upsert
 * PATCH   /api/rides/:id          ->  patch
 * DELETE  /api/rides/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Ride from './ride.model';
import mongoXlsx from 'mongo-xlsx';
import {Settlement} from './ride.model';
import _ from 'lodash';
import moment from 'moment-jalaali';
import User from '../user/user.model';
import {sendNotifDriver, sendNotifUser} from '../user/user.utility';
import shared from '../../config/environment/shared';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error('error> ', err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Rides
export function index(req, res) {
  let qs = req.query;
  qs.pagination = qs.pagination || {};
  qs.search = qs.search || {};
  let sort = false;

  if(_.has(qs, 'search.predicateObject')) {
    let props = ['date', 'cost', 'distance', 'stoppageTime', 'rate', 'paymentMethod'];
    for(let key in qs.search.predicateObject) {
      if(qs.search.predicateObject.hasOwnProperty(key)) {
        let value = qs.search.predicateObject[key];
        qs.search.predicateObject[key] = _.includes(props, key) ? value : new RegExp(value, 'i');
      }
    }
    if(_.has(qs, 'search.predicateObject.date')) {
      try {
        let date = moment(qs.search.predicateObject.date, 'jYYYY/jMM/jDD');
        if(date === 'Invalid date' || !date.isValid()) {
          Reflect.deleteProperty(qs.search.predicateObject, 'date');
        } else {
          let start = date.format('YYYY/MM/DD');
          let end = date.add(1, 'days').format('YYYY/MM/DD');
          qs.search.predicateObject.date = {
            $gte: new Date(start),
            $lt: new Date(end)
          };
        }
      } catch(e) {
        Reflect.deleteProperty(qs.search.predicateObject, 'date');
      }
    }
  }

  if(_.get(qs, 'sort.predicate', false)) {
    sort = {};
    sort[_.get(qs, 'sort.predicate', 'name')] = _.get(qs, 'sort.reverse') === 'true' ? -1 : 1;
  }

  let query;
  if(sort) {
    query = Ride.find(qs.search.predicateObject || {}, '-salt -password').sort(sort);
  } else {
    query = Ride.find(qs.search.predicateObject || {}, '-salt -password');
  }

  return _.clone(query).count((err, count) => {
    if(err) {
      handleError(res)(err);
    }
    return query
      .populate('user', shared.userFields.join(' '))
      .populate('driver', shared.userFields.join(' '))
      .skip(qs.pagination.start / qs.pagination.number * qs.pagination.number)
      .limit(Number(qs.pagination.number))
      .exec()
      .then(data => {
        let result = {
          data,
          numberOfPages: Math.ceil(count / qs.pagination.number)
        };
        res.status(200).json(result);
      })
      .catch(handleError(res));
  });
}

// Gets a single Ride from the DB
export function show(req, res) {
  return Ride.findById(req.params.id)
    .populate('user', _.join(shared.userFields, ' '))
    .populate('driver', _.join(shared.userFields, ' '))
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of user Rides from the DB
export function userRides(req, res) {
  return Ride.find({userId: req.params.id})
    .populate('user', _.join(shared.userFields, ' '))
    .populate('driver', _.join(shared.userFields, ' '))
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of user Rides from the DB
export function user(req, res) {
  let userId = req.user.id;
  return Ride.find({user: userId})
    .sort({date: -1})
    .populate('user', _.join(shared.userFields, ' '))
    .populate('driver', _.join(shared.userFields, ' '))
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of user Rides from the DB
export function driver(req, res) {
  let driverId = req.user.id;
  return Ride.find({driver: driverId})
    .sort({date: -1})
    .populate('user', _.join(shared.userFields, ' '))
    .populate('driver', _.join(shared.userFields, ' '))
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets available Rides from the DB
export function available(req, res) {
  nearDrivers(Number(req.params.lng), Number(req.params.lat), 100)
    .then(drivers => res.status(200).json(drivers))
    .catch(handleError(res));
}

// Creates a new Ride in the DB
export function create(req, res) {
  // send notification to drivers
  // if a driver accepted the ride then return driver info
  // calculate distance, cost and ... before send it to user

  let tempRide = new Ride();
  tempRide.user = req.user._id;
  tempRide.src = req.body.src;
  tempRide.loc = req.body.src;
  tempRide.des = req.body.des;
  tempRide.cost = req.body.cost || 25000;

  return nearDrivers(tempRide.src.coordinates[0], tempRide.src.coordinates[1], 20)
    .then(drivers => {
      if(!drivers || drivers.length === 0) {
        return handleError(res, 404)({message: 'راننده ای یافت نشد'});
      }

      return tempRide.save()
        .then(ride => sendNotifDriver(ride, _.map(drivers, 'appId'), shared.notificationKeys.rideRequest))
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

export function assign(req, res) {
  let driver = req.body.driver;
  return Ride.findById(req.params.id)
    .populate('user', shared.userFields.join(' '))
    .exec()
    .then(ride => {
      if(ride.status !== shared.rideStatus.searching) {
        return Promise.reject('سفر قبلا گرفته شده است');
      }
      return ride;
    })
    .then(ride => User.findByIdAndUpdate(req.body.driver, {ride: req.params.id}, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: false
    })
      .exec()
      .then(dr => {
        driver = dr.userInfo;
        return ride;
      }))
    .then(ride => User.findByIdAndUpdate(ride.user._id, {ride: req.params.id}, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: false
    })
      .exec()
      .then(() => ride))
    .then(ride => {
      ride.status = shared.rideStatus.onTheWay; // 'onTheWay'
      ride.driver = req.body.driver;
      return ride.save()
        .then(() => {
          sendNotifUser(driver, [ride.user.appId], shared.notificationKeys.driverFound);
          return _.pick(ride.user, shared.userFields);
        });
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// add driverId to Ride's rejections array
export function reject(req, res) {
  return Ride.findByIdAndUpdate(req.params.id, {$push: {rejections: req.body.driverId}}, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: false
  })
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Upserts the given Ride in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ride.findById(req.params.id)
    .populate('user', shared.userFields.join(' '))
    .populate('driver', shared.userFields.join(' '))
    .exec()
    .then(handleEntityNotFound(res))
    .then(ride => {
      _.forEach(req.body, (val, prop) => {
        ride[prop] = val || ride[prop];
      });
      return ride.save();
    })
    .then(ride => sendNotifUser(ride, [ride.user.appId], shared.notificationKeys.info))
    .then(respondWithResult(res))
    .catch(handleError(res));

  // return Ride.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   upsert: true,
  //   setDefaultsOnInsert: true,
  //   runValidators: false
  // })
  //   .populate('user', shared.userFields.join(' '))
  //   .populate('driver', shared.userFields.join(' '))
  //   .exec()
  //   .then(ride => sendNotifUser(ride, [ride.user.appId], shared.notificationKeys.info))
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// Updates an existing Ride in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ride.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Ride from the DB
export function destroy(req, res) {
  return Ride.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Settlement
export function settlement(req, res) {
  Settlement.findOne({}, {}, {sort: {date: -1}}, (err, date) => {
    if(err) {
      return handleError(res)(err);
    }

    let lastDate = (date || {}).date || new Date(0);
    let nextDate = new Date();
    return Ride.aggregate([
      {
        $match: {date: {$gt: lastDate}}
      },
      {
        $group: {
          _id: '$driver',
          total: {$sum: '$cost'},
          count: {$sum: 1}
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driver'
        }
      },
      {
        $unwind: {
          path: '$driver'
        }
      },
      {
        $project: {
          _id: 0,
          'نام': '$driver.name',
          'کد ملی': '$driver.nationalCode',
          'همراه': '$driver.mobile',
          'شماره حساب': '$driver.accountNumber',
          'تعداد سفر': '$count',
          'مجموع': '$total'
        }
      },
      {
        $sort: {'نام': 1}
      }
    ])
      .exec()
      .then(handleEntityNotFound(res))
      .then(data => {
        if(!data || !data.length) {
          return [];
        }
        let model = mongoXlsx.buildDynamicModel(data);
        let options = {
          save: true,
          // fileName         : `settlement-${nextDate.toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`,
          fileName: `settlement-${moment(nextDate).format('jYYYY-jMM-jDD_HH-mm-ss')}.xlsx`,
          defaultSheetName: 'worksheet',
          path: './client/assets/reports'
        };
        console.log('moment ', moment(nextDate).format('jYYYY-jMM-jDD_HH-mm-ss'));
        mongoXlsx.mongoData2Xlsx(data, model, options, (err, result) => {
          console.log('File saved at:', result.fullPath);
          Settlement.create({
            date: nextDate
          });
        });
        return data;
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  });
}

// Settlement
export function dates(req, res) {
  return Settlement.find({}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function nearDrivers(lng, lat, limit = 100) {
  return User.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        query: {
          role: 'driver',
          driverState: 'on'
        },
        maxDistance: 3000,
        limit,
        spherical: true,
        distanceField: 'distance'
      }
    }
  ])
    .exec()
    .then(drivers => _.map(drivers, _.partialRight(_.pick, _.concat(shared.userFields, 'distance'))));
}

// Gets Ride's cost from the DB
// export function cost(req, res) {
//   return Ride.findById(req.params.id).exec()
//     .then(handleEntityNotFound(res))
//     .then(respondWithResult(res))
//     .catch(handleError(res));
// }

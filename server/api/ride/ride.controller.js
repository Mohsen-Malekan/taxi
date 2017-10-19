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
import shared from '../../config/environment/shared';
import gcm from 'node-gcm';

let senderDriver = new gcm.Sender('AAAAJ0RBioc:APA91bEV4CN4HO7ViIv827m1uWnXhR6RdBsiU2Hrr0ZVX0LJdkQW0ULZfW3acII4fqYYL87z8dile-5IUKATbCjynYWLTiqhaizYiaDEjSsRJbgtn6JuFpiXxeQVUQrqTIAMjUGarl6k');
let senderUser = new gcm.Sender('AAAAGWLSfjM:APA91bHpXuRj4Y1wSnbqNFEmCmNuej4GUNHnrye1D3ZwiuJzi7db0KlJaHlpFZ_Hf5oMLqsaBSOSQsjZusPu5iVPjuj-nbAMVUqawAZ_jEYOqvA4Jd1G82GMFJtPDUBJerXjHQuLFJAd');

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
    let props = ['date', 'cost'];
    for(let key in qs.search.predicateObject) {
      if(qs.search.predicateObject.hasOwnProperty(key)) {
        let value = qs.search.predicateObject[key];
        qs.search.predicateObject[key] = _.includes(props, key) ? value : new RegExp(value, 'i');
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
      .populate('user', 'name mobile')
      .populate('driver', 'name mobile')
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

  // return Ride.find().exec()
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// Gets a single Ride from the DB
export function show(req, res) {
  return Ride.findById(req.params.id)
    .populate('user', 'name mobile')
    .populate('driver', 'name mobile').exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of user Rides from the DB
export function userRides(req, res) {
  return Ride.find({userId: req.params.id}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of user Rides from the DB
export function user(req, res) {
  let user = req.user.id;
  return Ride.find({user})
    .populate('driver', _.join(shared.userFields, ' ')).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets available Rides from the DB
export function available(req, res) {
  nearDrivers(Number(req.params.lng), Number(req.params.lat))
    .then(drivers => res.status(200).json(drivers))
    .catch(handleError(res));
}

// Gets Ride's cost from the DB
export function cost(req, res) {
  // todo: calculate ride's cost
  return Ride.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
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

// Creates a new Ride in the DB
export function create(req, res) {
  // todo: send notification to drivers
  // todo: if a driver accepted the ride then return driver info
  // todo: calculate distance, cost and ... before send it to user

  let ride = new Ride();
  ride.user = req.user._id;
  ride.src = req.body.src;
  ride.loc = req.body.src;
  ride.des = req.body.des;
  ride.cost = req.body.cost || 5000;
  console.log('ride > ', ride);
  return ride.save()
    .then(newRide => nearDrivers(newRide.src.coordinates[0], newRide.src.coordinates[1])
      .then(drivers => {
        console.log('newRide > ', newRide);
        if(!drivers || drivers.length === 0) {
          return handleError(res, 404)({message: 'راننده ای یافت نشد'});
        }
        let appIdList = _.map(drivers, 'appId');
        console.log(`appIdList ${appIdList}`);
        let message = new gcm.Message({
          collapseKey: 'taxi',
          delayWhileIdle: true,
          timeToLive: 3,
          data: newRide
        });
        senderDriver.send(message, appIdList, 1, (err, result) => {
          if(err) {
            console.log('gcm error> ', err);
          }
          console.log('gcm result> ', result);
        });
        return newRide;
      })
      .catch(handleError(res)))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Upserts the given Ride in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ride.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(ride => {
      if(_.has(req.body, 'status')) {
        return User.findByIdAndUpdate(ride.driver, {driverState: 'on'}).exec()
          .then(() => User.findById(ride.user).exec()
            .then(user => {
              let message = new gcm.Message({
                collapseKey: 'taxi',
                delayWhileIdle: true,
                timeToLive: 3,
                data: ride
              });
              senderUser.send(message, [user.appId], 1, (err, result) => {
                if(err) {
                  console.log('gcm error> ', err);
                }
                console.log('gcm result> ', result);
              });
              return ride;
            }));
      }
      return ride;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function assign(req, res) {
  return Ride.findById(req.params.id).exec()
    .then(ride => {
      if(ride.status !== shared.rideStatus[0]) {
        return Promise.reject('سفر قبلا گرفته شده است');
      }
      ride.status = shared.rideStatus[1]; // 'onTheWay'
      ride.driver = req.body.driver;
      return ride.save();
    })
    .then(ride => User.findByIdAndUpdate(ride.driver, {driverState: 'riding'}).exec()
      .then(driver => User.findById(ride.user).exec()
        .then(user => {
          let message = new gcm.Message({
            collapseKey: 'taxi',
            delayWhileIdle: true,
            timeToLive: 3,
            data: driver
          });
          senderUser.send(message, [user.appId], 1, (err, result) => {
            if(err) {
              console.log('gcm error> ', err);
            }
            console.log('gcm result> ', result);
          });
          return user;
        })))
    .then(respondWithResult(res))
    .catch(handleError(res));
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

function nearDrivers(lng, lat) {
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
        // maxDistance: 2000,
        limit: 50,
        spherical: true,
        distanceField: 'distance'
      }
    }
  ])
    .exec()
    .then(drivers => _.map(drivers, _.partialRight(_.pick, _.concat(shared.userFields, 'distance'))));
}

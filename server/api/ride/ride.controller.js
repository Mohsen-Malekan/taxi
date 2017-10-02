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
import {Settlement} from './ride.model'
import _ from 'lodash';

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
    for(let key in qs.search.predicateObject) {
      if(qs.search.predicateObject.hasOwnProperty(key)) {
        let value = qs.search.predicateObject[key];
        qs.search.predicateObject[key] = new RegExp(value, 'i');
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
  return Ride.findById(req.params.id).exec()
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
  let userId = req.user.id;
  return Ride.find({userId}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets available Rides from the DB
export function available(req, res) {
  // return Ride.findById(req.params.id).exec()
  //   .then(handleEntityNotFound(res))
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
  // todo: get available drivers in area from driver's table
  return res.status(200).json([]);
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
  Settlement.findOne({}, {}, { sort : { date : -1 } }, (err, date) => {
    let lastDate = (date || {}).date || new Date(0);
    let nextDate = new Date();
    console.log('settlement> ', lastDate, nextDate);
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
          path : '$driver'
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
        $sort : {'نام' : 1}
      }
    ])
      .exec()
      .then(handleEntityNotFound(res))
      .then(data => {
        if (!data || !data.length) {
          return [];
        }
        let model = mongoXlsx.buildDynamicModel(data);
        let options = {
          save: true,
          fileName: `settlement-${nextDate.toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`,
          defaultSheetName: 'worksheet',
          path: './client/assets/reports'
        };
        mongoXlsx.mongoData2Xlsx(data, model, options, (err, result) => {
          console.log('File saved at:', result.fullPath);
          Settlement.create({
            date : nextDate
          });
        });
        return data;
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  });
}

// Creates a new Ride in the DB
export function create(req, res) {
  // todo: send notification to drivers
  // todo: if a driver accepted the ride then return driver info
  // todo: calculate distance, cost and ... before send it to user
  let driver = {};
  let ride = new Ride();
  return ride.save()
    .then(entity => res.status(201).json({
      entity,
      driver
    }))
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

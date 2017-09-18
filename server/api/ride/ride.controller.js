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
    res.status(statusCode).send(err);
  };
}

// Gets a list of Rides
export function index(req, res) {
  return Ride.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
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
  return Ride.find({userId : req.params.id}).exec()
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

// Creates a new Ride in the DB
export function create(req, res) {
  // todo: send notification to drivers
  // todo: if a driver accepted the ride then return driver info
  // todo: calculate distance, cost and ... before send it to user
  let driver = {};
  let ride = new Ride();
  return ride.save()
    .then(entity => res.status(201).json({entity, driver}))
    .catch(handleError(res));
}

// Upserts the given Ride in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ride.findOneAndUpdate({_id : req.params.id}, req.body, {new : true, upsert : true, setDefaultsOnInsert : true, runValidators : true}).exec()

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

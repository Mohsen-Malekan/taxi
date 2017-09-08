/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/favorites              ->  index
 * POST    /api/favorites              ->  create
 * GET     /api/favorites/:id          ->  show
 * PUT     /api/favorites/:id          ->  upsert
 * PATCH   /api/favorites/:id          ->  patch
 * DELETE  /api/favorites/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Favorite from './favorite.model';

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

// Gets a list of Favorites for current user
export function index(req, res) {
  let userId = req.user.id;
  return Favorite.find({userId}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Favorite from the DB
export function show(req, res) {
  return Favorite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Favorite in the DB
export function create(req, res) {
  req.body.userId = req.user.id;
  return Favorite.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Favorite in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Favorite.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Favorite in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Favorite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Favorite from the DB
export function destroy(req, res) {
  return Favorite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

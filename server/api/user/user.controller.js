'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import request from 'request';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import jsonpatch from 'fast-json-patch';

const SMS_URL = 'https://api.kavenegar.com/v1/7879382B54572F574B4E6C3832754934355048687A773D3D/sms/';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    console.log('validationError> ', err);
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log('handleError> ', err);
    return res.status(statusCode).send(err);
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

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  let qs = req.query;
  qs.pagination = qs.pagination || {};
  qs.search = qs.search || {};
  let sort = false;

  if(_.has(qs, 'search.predicateObject')) {
    let props = ['active', 'rate', 'date'];
    for(let key in qs.search.predicateObject) {
      if(qs.search.predicateObject.hasOwnProperty(key) && key !== 'role') {
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
    query = User.find(qs.search.predicateObject || {}, '-salt -password').sort(sort);
  } else {
    query = User.find(qs.search.predicateObject || {}, '-salt -password');
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

  // return User.find({}, '-salt -password').exec()
  //   .then(users => {
  //     res.status(200).json(users);
  //   })
  //   .catch(handleError(res));
}

/**
 * toggle user activation
 * restriction: 'admin'
 */
export function toggleActivation(req, res) {
  return User.findByIdAndToggle(req.params.id)
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  let newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.sharingCode = randomstring.generate(6).toUpperCase();
  newUser.activationCode = randomstring.generate({
    length: 5,
    charset: 'numeric'
  }).toString();
  newUser.save()
    .then(function(user) {
      // send activationCode to user
      request(`${SMS_URL}send.json?receptor=${user.mobile}&sender=10004346&message=${user.activationCode}`, (error, response, body) => {
        console.log('sms error:      ', error || 'none'); // Print the error if one occurred
        console.log('sms statusCode: ', response && response.statusCode); // Print the response status code if a response was received
      });
      let token = jwt.sign({_id: user._id}, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      let userInfo = _.pick(user, [
        'name',
        'email',
        'mobile',
        'role',
        'active',
        'lastState',
        'lastLat',
        'lastLng',
        'asset',
        'sharingCode']);
      userInfo.id = user._id;
      res.json({
        token,
        user: userInfo
      });
    })
    .catch(validationError(res));
}

/**
 * Creates a new user with role='driver'
 */
export function createDriver(req, res) {
  const DEFAULT_PASS = 'zxcv123fdsa654qwer789';
  let newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'driver';
  newUser.sharingCode = randomstring.generate(6).toUpperCase();
  // newUser.activationCode = randomstring.generate({length : 5, charset : 'numeric'}).toString();
  newUser.active = true;
  newUser.password = DEFAULT_PASS;
  newUser.save()
    .then(user =>
      _.forEach(req.files, (val, key) => {
        let file = val[0];
        let tempPath = file.path;
        let ext = _.last(_.split(file.originalname, '.'));
        let targetPath = path.join(__dirname, '../../../client/assets/images/', `${user._id}.${key}.${ext}`);
        return fs.rename(tempPath, targetPath, function(err) {
          if(err) return handleError(res)(err);
          return fs.unlink(tempPath, function() {
            if(err) return handleError(res)(err);
            return user;
          });
        });
      }))
    .then(user => {
      let token = jwt.sign({_id: user._id}, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      let userInfo = _.pick(user, [
        'name',
        'email',
        'mobile',
        'role',
        'active',
        'lastState',
        'lastLat',
        'lastLng',
        'asset',
        'sharingCode']);
      userInfo.id = user._id;
      res.json({
        token,
        user: userInfo
      });
    })
    .catch(validationError(res));
}

/**
 * Creates a new user with role='admin'
 */
export function createAdmin(req, res) {
  let newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'admin';
  newUser.active = true;
  newUser.sharingCode = randomstring.generate(6).toUpperCase();
  newUser.activationCode = randomstring.generate({
    length: 5,
    charset: 'numeric'
  }).toString();
  newUser.save()
    .then(function(user) {
      // send activationCode to user
      // request(`${SMS_URL}send.json?receptor=${user.mobile}&sender=10004346&message=${user.activationCode}`, (error, response, body) => {
      //   console.log('sms error:      ', error || 'none'); // Print the error if one occurred
      //   console.log('sms statusCode: ', response && response.statusCode); // Print the response status code if a response was received
      // });
      let token = jwt.sign({_id: user._id}, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      let userInfo = _.pick(user, [
        'name',
        'email',
        'mobile',
        'role',
        'active',
        'lastState',
        'lastLat',
        'lastLng',
        'asset',
        'sharingCode']);
      userInfo.id = user._id;
      res.json({
        token,
        user: userInfo
      });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  let userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

// Updates an existing Ride in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return User.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  let userId = req.user._id;
  let oldPass = String(req.body.oldPassword);
  let newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Change a users password
 */
export function edit(req, res) {
  let userId = req.user._id;

  return User.findById(userId).exec()
    .then(user => {
      let props = [
        // 'name',
        'email',
        // 'mobile',
        // 'nationalCode',
        'accountNumber',
        // 'role',
        // 'date',
        // 'asset',
        // 'rate',
        // 'active',
        'driverState',
        'appId',
        'location',
        // 'sharingCode',
        // 'challengerCode',
        'lastState'
      ];
      _.each(props, prop => {
        user[prop] = req.body[prop] || user[prop];
      });
      return user.save()
        .then(() => {
          res.json(_.pick(user, props));
        })
        .catch(validationError(res));
    });
}

/**
 * send activationCode to user
 */
export function getActivationCode(req, res) {
  let userId = req.user._id;

  return User.findById(userId, '-salt -password').exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      let activationCode = randomstring.generate({
        length: 5,
        charset: 'numeric'
      }).toString();
      user.activationCode = activationCode;
      return user.save()
        .then(() => {
          // end activation code to user
          request(`${SMS_URL}send.json?receptor=${user.mobile}&sender=10004346&message=${user.activationCode}`, (error, response, body) => {
            console.log('sms error:      ', error || 'none'); // Print the error if one occurred
            console.log('sms statusCode: ', response && response.statusCode); // Print the response status code if a response was received
          });
          return res.json({activationCode});
        })
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

/**
 * confirm user
 */
export function confirm(req, res) {
  let userId = req.user._id;
  let appId = req.body.appId;

  return User.findById(userId, '-salt -password').exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      if(user.activationCode === req.body.activationCode) {
        user.active = true;
        user.appId = appId;
        return user.save()
          .then(() => res.json({}))
          .catch(handleError(res));
      }
      return res.status(400).end();
    })
    .catch(handleError(res));
}

/**
 * Get my info
 */
export function me(req, res, next) {
  let userId = req.user._id;

  return User.findOne({_id: userId}, '-salt -password -activationCode').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

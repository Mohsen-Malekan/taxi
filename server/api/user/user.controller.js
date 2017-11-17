'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import jsonpatch from 'fast-json-patch';
import randomstring from 'randomstring';
import moment from 'moment-jalaali';
import {sendSMS} from './user.utility';
import Ride from '../ride/ride.model';

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
    let props = ['active', 'rate', 'date', 'asset'];
    for(let key in qs.search.predicateObject) {
      if(qs.search.predicateObject.hasOwnProperty(key) && key !== 'role') {
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
    query = User.find(qs.search.predicateObject || {}, _.join(config.userFields, ' ')).sort(sort);
  } else {
    query = User.find(qs.search.predicateObject || {}, _.join(config.userFields, ' '));
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
  User.findOneAndRemove({
    mobile: req.body.mobile,
    active: false
  })
    .exec()
    .then(() => {
      let newUser = new User(req.body);
      newUser.save()
        .then(user => sendSMS(user))
        .then(user => {
          let token = jwt.sign({_id: user._id}, config.secrets.session, {
            expiresIn: '5000d'
          });
          res.json({
            token,
            user: user.userInfo
          });
        })
        .catch(validationError(res));
    })
    .catch(validationError(res));

}

/**
 * Creates a new user with role='driver'
 */
export function createDriver(req, res) {
  User.findOneAndRemove({
    mobile: req.body.mobile,
    active: false
  })
    .exec()
    .then(() => {
      let newUser = new User(req.body);
      newUser.role = 'driver';
      newUser.save()
        .then(user => sendSMS(user))
        .then(user => {
          _.forEach(req.files, (val, key) => {
            let file = val[0];
            let tempPath = file.path;
            // let ext = _.last(_.split(file.originalname, '.'));
            let targetPath = path.join(__dirname, '../../../client/assets/images/', `${user._id}.${key}.jpg`);
            fs.rename(tempPath, targetPath, err => {
              // if(err) return handleError(res)(err);
              if(err) console.log('createDriver:rename> ', err);
              fs.unlink(tempPath, err => {
                if(err) console.log('createDriver:unlink> ', err);
              });
            });
          });
          let token = jwt.sign({_id: user._id}, config.secrets.session, {
            expiresIn: '5000d'
          });
          return res.json({
            token,
            user: user.userInfo
          });
        })
        .catch(validationError(res));
    })
    .catch(validationError(res));
}

/**
 * Creates a new user with role='admin'
 */
export function createAdmin(req, res) {
  User.findOneAndRemove({
    mobile: req.body.mobile,
    active: false
  })
    .exec()
    .then(() => {
      let newUser = new User(req.body);
      newUser.role = 'admin';
      newUser.active = true;
      newUser.save()
        .then(function(user) {
          let token = jwt.sign({_id: user._id}, config.secrets.session, {
            expiresIn: '5000d'
          });
          res.json({
            token,
            user: user.userInfo
          });
        })
        .catch(validationError(res));
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  let userId = req.params.id;

  return User.findById(userId).exec()
    .then(handleEntityNotFound(res))
    .then(user => res.json(user.profile))
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
    .then(user => {
      _.forEach(['photos[0]', 'photos[1]'], (val, key) => {
        let targetPath = path.join(__dirname, '../../../client/assets/images/', `${user._id}.${val}.jpg`);
        if(fs.existsSync(targetPath)) {
          fs.unlink(targetPath, err => {
            if(err) console.error(err);
          });
        }
      });
      return res.status(204).end();
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
      let props = ['email', 'accountNumber', 'driverState', 'appId', 'location', 'lastState'];
      _.each(props, prop => {
        user[prop] = req.body[prop] || user[prop];
      });
      return user.save()
        .then(updatedUser => res.json(updatedUser.userInfo))
        .catch(validationError(res));
    })
    .catch(handleError(res));
}

/**
 * send activationCode to user
 */
export function getActivationCode(req, res) {
  let userId = req.user._id;
  let activationCode = randomstring.generate({
    length: 5,
    charset: 'numeric'
  }).toString();

  return User.findByIdAndUpdate(userId, {activationCode}, {new: true}).exec()
    .then(user => sendSMS(user))
    .then(() => res.json({activationCode}))
    .catch(handleError(res));
}

/**
 * confirm user
 */
export function confirm(req, res) {
  let userId = req.user._id;
  let appId = req.body.appId;

  return User.findById(userId, '-salt -password').exec()
    .then(handleEntityNotFound(res))
    .then(user => {
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
export function me(req, res) {
  let userId = req.user._id;

  return User.findById(userId, '-salt -password -activationCode')
    .exec()
    .then(handleEntityNotFound(res))
    .then(user => {
      if(user.ride) {
        return Ride.findById(user.ride)
          .populate('user', _.join(config.userFields, ' '))
          .populate('driver', _.join(config.userFields, ' '))
          .exec()
          .then(ride => {
            user.ride = ride;
            return user;
          });
      }
      return user;
    })
    .then(user => user.userInfo)
    .then(user => {
      if(user.role === 'driver') {
        return Ride.find({
          driver: user.id,
          status: config.rideStatus.finished,
          date: {
            $gte: new Date(moment().startOf('day')),
            $lte: new Date(moment().endOf('day'))
          }
        })
          .exec()
          .then(rides => {
            console.log(`start ${new Date(moment().startOf('day'))}`);
            console.log(`end ${new Date(moment().endOf('day'))}`);
            console.log(`rides>>>>> ${rides.length}`);
            let dailyRate = 0;
            let dailyIncome = 0;
            _.forEach(rides, ride => {
              dailyRate += ride.rate || 0;
              dailyIncome += ride.cost;
            });
            dailyRate = dailyRate / (rides.length || 1);
            user.dailyRate = dailyRate;
            user.dailyIncome = dailyIncome;
            console.log(`user>>>>> ${dailyRate} , ${dailyIncome}`);
            console.log(`user>>>>> ${user.dailyRate} , ${user.dailyIncome}`);
            return user;
          });
      }
      return user;
    })
    .then(user => res.json(user))
    .catch(handleError(res));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

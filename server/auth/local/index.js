'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';
import User from '../../api/user/user.model';
import randomstring from 'randomstring';
import {sendSMS} from '../../api/user/user.utility';

let router = express.Router();

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log('handleError> ', err);
    return res.status(statusCode).send(err);
  };
}

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    err = err || info;
    if(err) {
      return res.status(401).json(err);
    }
    if(!user) {
      return res.status(404).json({message: 'درحال حاضر نمیتوانید وارد شوید. لطفا دوباره تلاش کنید'});
    }

    let activationCode = randomstring.generate({
      length: 5,
      charset: 'numeric'
    }).toString();

    return User.findByIdAndUpdate(user._id, {$set: {activationCode}}, {new: true}).exec()
      .then(updatedUser => {
        let token = signToken(updatedUser._id, updatedUser.role);

        return sendSMS(updatedUser)
          .then(() => res.json({
            token,
            user: updatedUser.userInfo
          }))
          .catch(handleError(res));
      })
      .catch(handleError(res));
  })(req, res, next);
});

export default router;

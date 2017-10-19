'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';
import User from '../../api/user/user.model';
import randomstring from 'randomstring';
import {sendSMS} from '../../api/user/user.utility';

let router = express.Router();

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
          .catch(err => res.status(500).send(err));
      })
      .catch(error => res.status(500).send(error));
  })(req, res, next);
});

export default router;

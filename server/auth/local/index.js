'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';
import _ from 'lodash';
import request from 'request';
import User from '../../api/user/user.model';
import randomstring from 'randomstring';
import shared from '../../config/environment/shared';

const SMS_URL = 'https://api.kavenegar.com/v1/7879382B54572F574B4E6C3832754934355048687A773D3D/sms/';
let router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'درحال حاضر نمیتوانید وارد شوید. لطفا دوباره تلاش کنید'});
    }

    let userInfo = _.pick(user, shared.userFields);
    userInfo.id = user._id;
    let activationCode = randomstring.generate({
      length: 5,
      charset: 'numeric'
    }).toString();

    User.findByIdAndUpdate(user._id, {$set: {activationCode}}, (err, oldUser) => {
      if(err) {
        console.log('user update error: ', err || 'none');
        return res.status(500).send(err);
      }

      let token = signToken(user._id, user.role);

      request(`${SMS_URL}send.json?receptor=${user.mobile}&sender=10004346&message=${activationCode}`, (err, response, body) => {
        if(err) {
          console.log('sms error: ', err || 'none'); // Print the error if one occurred
          return res.status(500).send(err);
        }
        res.json({
          token,
          user: userInfo
        });
      });
    });
  })(req, res, next);
});

export default router;

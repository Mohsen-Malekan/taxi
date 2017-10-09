'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';
import _ from 'lodash';
import request from 'request';

const SMS_URL = 'https://api.kavenegar.com/v1/7879382B54572F574B4E6C3832754934355048687A773D3D/sms/';
let router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message : 'درحال حاضر نمیتوانید وارد شوید. لطفا دوباره تلاش کنید'});
    }

    let userInfo = _.pick(user, [
      'name',
      'email',
      'mobile',
      'nationalCode',
      'accountNumber',
      'role',
      'date',
      'asset',
      'rate',
      'active',
      'driverState',
      'appId',
      'location',
      'sharingCode',
      'challengerCode',
      'lastState'
    ]);
    userInfo.id = user._id;

    let token = signToken(user._id, user.role);

    request(`${SMS_URL}send.json?receptor=${user.mobile}&sender=10004346&message=${user.activationCode}`, (err, response, body) => {
      if(err) {
        console.log('sms error:      ', error || 'none'); // Print the error if one occurred
        return res.status(500).send(err);
      }
      res.json({ token, user : userInfo });
    });
  })(req, res, next);
});

export default router;

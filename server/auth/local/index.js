'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';
import _ from 'lodash';

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

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

    let token = signToken(user._id, user.role);
    res.json({ token, user: userInfo });
  })(req, res, next);
});

export default router;

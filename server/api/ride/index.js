'use strict';

import {Router} from 'express';
import * as controller from './ride.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/user', auth.isAuthenticated(), controller.user);
router.get('/user/:id', auth.hasRole('admin'), controller.userRides);
router.get('/available/:lng/:lat/:radius', auth.isAuthenticated(), controller.available);
router.get('/Settlement', auth.hasRole('admin'), controller.settlement);
router.get('/dates', auth.hasRole('admin'), controller.dates);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/assign/:id', auth.hasRole('driver'), controller.assign);
router.put('/reject/:id', auth.isAuthenticated(), controller.reject);
router.put('/:id', auth.isAuthenticated(), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/cost/:id', auth.isAuthenticated(), controller.cost);

module.exports = router;

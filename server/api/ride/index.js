'use strict';

import {Router} from 'express';
import * as controller from './ride.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.get('/user', auth.isAuthenticated(), controller.user);
router.get('/available', auth.isAuthenticated(), controller.available);
router.get('/cost/:id', auth.isAuthenticated(), controller.cost);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.upsert);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;

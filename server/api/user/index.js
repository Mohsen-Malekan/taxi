'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.post('/', controller.create);
router.post('/driver', auth.hasRole('admin'), controller.createDriver);
router.get('/confirm', auth.isAuthenticated(), controller.getActivationCode);
router.post('/confirm', auth.isAuthenticated(), controller.confirm);
router.get('/:id', auth.hasRole('admin'), controller.show);

module.exports = router;

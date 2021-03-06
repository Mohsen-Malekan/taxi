'use strict';

import multer from 'multer';
import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

let upload = multer({dest: 'uploads/'});
let router = new Router();

let fields = [
  {
    name: 'photos[0]',
    maxCount: 1
  },
  {
    name: 'photos[1]',
    maxCount: 1
  }
];

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/toggleActivation/:id', auth.hasRole('admin'), controller.toggleActivation);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id', auth.isAuthenticated(), controller.edit);
router.post('/', controller.create);
router.post('/driver', upload.fields(fields), controller.createDriver);
router.post('/admin', auth.hasRole('admin'), controller.createAdmin);
router.get('/confirm', auth.isAuthenticated(), controller.getActivationCode);
router.post('/confirm', auth.isAuthenticated(), controller.confirm);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.patch('/:id', auth.hasRole('admin'), controller.patch);

module.exports = router;

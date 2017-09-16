'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import driverRegister from '../driver-register/driver-register.component';

export default angular.module('taxiApp.admin', ['taxiApp.auth', 'ui.router',
  driverRegister])
  .config(routes)
  .controller('AdminController', AdminController)
  .name;

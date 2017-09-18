'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import smartTable from 'angular-smart-table';
import driverRegister from '../driver-register/driver-register.component';
import users from '../users/users.component';

export default angular.module('taxiApp.admin', [smartTable, 'taxiApp.auth', 'ui.router',
  driverRegister, users])
  .config(routes)
  .controller('AdminController', AdminController)
  .name;

'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import smartTable from 'angular-smart-table';
import driverRegister from '../driver-register/driver-register.component';
import adminRegister from '../admin-register/admin-register.component';
import users from '../users/users.component';
import reports from '../reports/reports.component';
import notifications from '../admin-notifications/admin-notifications.component';
import settlement from '../settlement/settlement.component';

export default angular.module('taxiApp.admin', [smartTable, 'taxiApp.auth', 'ui.router',
  driverRegister, adminRegister, users, reports, notifications, settlement])
  .config(routes)
  .controller('AdminController', AdminController)
  .name;

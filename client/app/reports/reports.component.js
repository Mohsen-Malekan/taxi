import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './reports.routes';

class ReportsController {
  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }
}

export default angular.module('taxiApp.admin.reports', [uiRouter])
  .config(routing)
  .component('reports', {
    template     : require('./reports.html'),
    controller   : ReportsController,
    controllerAs : 'vm'
  })
  .name;

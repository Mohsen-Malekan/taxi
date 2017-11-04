'ngInject';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './reports-running.routes';
import _ from 'lodash';

class ReportsController {
  isLoading = false;

  /*@ngInject*/
  constructor($http, $httpParamSerializerJQLike, $stateParams) {
    this.$http = $http;
    this.$hps = $httpParamSerializerJQLike;
    this.$stateParams = $stateParams;
  }

  callServer(tableState) {
    this.$parent.vm.isLoading = true;
    tableState.search = _.merge(tableState.search, {predicateObject: {status: 'inProgress'}});

    console.log(tableState);

    this.$parent.vm.$http.get(`api/rides?${this.$parent.vm.$hps(tableState)}`)
      .then(result => {
        this.$parent.vm.rides = result.data.data;
        tableState.pagination.numberOfPages = result.data.numberOfPages;
        this.$parent.vm.isLoading = false;
      });
  }
}

export default angular.module('taxiApp.admin.reports.running', [uiRouter])
  .config(routing)
  .component('reportsRunning', {
    template: require('./reports-running.html'),
    controller: ReportsController,
    controllerAs: 'vm'
  })
  .name;

'ngInject';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './reports-finished.routes';
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
    tableState.search = _.merge(tableState.search, {predicateObject: {status: 'finished'}});

    console.log(tableState);

    this.$parent.vm.$http.get(`api/rides?${this.$parent.vm.$hps(tableState)}`)
      .then(result => {
        this.$parent.vm.rides = result.data.data;
        tableState.pagination.numberOfPages = result.data.numberOfPages;
        this.$parent.vm.isLoading = false;
      });
  }
}

export default angular.module('taxiApp.admin.reports.finished', [uiRouter])
  .config(routing)
  .component('reportsFinished', {
    template: require('./reports-finished.html'),
    controller: ReportsController,
    controllerAs: 'vm'
  })
  .name;

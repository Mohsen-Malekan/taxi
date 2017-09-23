'ngInject';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './reports.routes';
import _ from 'lodash';

class ReportsController {
  /*@ngInject*/
  constructor($http, $httpParamSerializerJQLike, $stateParams) {
    this.$http = $http;
    this.$hps = $httpParamSerializerJQLike;
    this.$stateParams = $stateParams;
  }

  $onInit() {}

  callServer(tableState) {
    this.$parent.vm.isLoading = true;
    tableState.search = _.merge(tableState.search, { predicateObject : { isDone : true } });

    this.$parent.vm.$http.get(`api/rides?${this.$parent.vm.$hps(tableState)}`).then(result => {
      this.$parent.vm.users = result.data.data;
      tableState.pagination.numberOfPages = result.data.numberOfPages;
      this.$parent.vm.isLoading = false;
    });
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

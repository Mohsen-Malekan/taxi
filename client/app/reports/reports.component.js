'ngInject';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './reports.routes';
import finished from '../reports-finished/reports-finished.component';
import running from '../reports-running/reports-running.component';
import _ from 'lodash';

class ReportsController {
  /*@ngInject*/
  constructor($state) {
    this.$state = $state;
  }

  $onInit() {
    let titles = {
      finished: 'سفرهای انجام شده',
      running: 'سفرهای در حال انجام'
    };
    let url = this.$state.href(this.$state.current.name, this.$state.params);
    this.title = titles[_.split(url, '/')[3]] || '';
  }

  // callServer(tableState) {
  //   this.$parent.vm.isLoading = true;
  //   tableState.search = _.merge(tableState.search, {predicateObject: {isDone: true}});
  //
  //   this.$parent.vm.$http.get(`api/rides?${this.$parent.vm.$hps(tableState)}`).then(result => {
  //     this.$parent.vm.users = result.data.data;
  //     tableState.pagination.numberOfPages = result.data.numberOfPages;
  //     this.$parent.vm.isLoading = false;
  //   });
  // }
}

export default angular.module('taxiApp.admin.reports', [uiRouter, finished, running])
  .config(routing)
  .component('reports', {
    template: require('./reports.html'),
    controller: ReportsController,
    controllerAs: 'vm'
  })
  .name;

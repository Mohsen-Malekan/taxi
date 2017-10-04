'ngInject';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './settlement.routes';
import 'angular-print/angularPrint.css';
import 'angular-print/angularPrint.js';
import jalaali from './jalaali.filter';
import fileName from './file-name.filter';

class SettlementController {
  users = [];

  /*@ngInject*/
  constructor($http, $uibModal) {
    this.$http = $http;
    this.$uibModal = $uibModal;
  }

  getUsers() {
    return this.$http.get('api/rides/settlement')
      .then(res => {
        this.users = res.data;
      });
  }

  archive() {
    this.$uibModal.open({
      animation    : true,
      template     : require('./archive.html'),
      /*@ngInject*/
      controller   : 'ArchiveModalController',
      controllerAs : 'modal',
      size         : 'lg',
      resolve      : {
        /*@ngInject*/
        dates : $http => $http.get('api/rides/dates')
          .then(res => res.data)
      }
    });
  }
}

class ArchiveModalController {
  /*@ngInject*/
  constructor(dates) {
    this.dates = dates;
  }
}

export default angular.module('taxiApp.admin.settlement', [uiRouter, 'AngularPrint'])
  .config(routing)
  .filter('jalaali', jalaali)
  .filter('fileName', fileName)
  .component('settlement', {
    template     : require('./settlement.html'),
    controller   : SettlementController,
    controllerAs : 'vm'
  })
  .controller('ArchiveModalController', ArchiveModalController)
  .name;

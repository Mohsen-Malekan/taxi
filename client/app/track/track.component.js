import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './track.routes';

class TrackController {
  /*@ngInject*/
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  $onInit() {
    if(this.ride && this.ride.status === 'finished') {
      this.$uibModal.open({
        animation: true,
        template: '<div>'
        // + '<div class="modal-header">'<h3 class="modal-title">عنوان</h3></div>'
        + '<div class="modal-body"><h3>سفر به اتمام رسیده است</h3></div>'
        + '<div class="modal-footer">'
        + '<button class="btn btn-default" type="button" ng-click="$dismiss()">بستن</button></div>'
        + '</div>',
        windowClass: 'modal-warning'
      });
    }
  }
}

export default angular.module('taxiApp.track', [uiRouter])
  .config(routing)
  .component('track', {
    template: require('./track.html'),
    controller: TrackController,
    controllerAs: 'vm',
    bindings: {
      ride: '<'
    }
  })
  .name;

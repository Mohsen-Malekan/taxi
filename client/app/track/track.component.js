import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './track.routes';

class TrackController {
  user = {
    name: '',
    mobile: '',
    email: ''
  };

  /*@ngInject*/
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  $onInit() {
    if(this.ride && this.ride.isDone) {
      this.$uibModal.open({
        animation: true,
        template: '<div class="modal-header">'
        + '<h3 class="modal-title">عنوان</h3>'
        + '</div><div class="modal-body">سفر به اتمام رسیده است</div><div class="modal-footer">'
        + '<button class="btn btn-primary" type="button" ng-click="$dismiss()">بستن</button></div>',
        windowClass: 'modal-info'
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

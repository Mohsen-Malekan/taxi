// import './maps.google';
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './track.routes';
import ngMap from 'ngmap';

class TrackController {
  googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDiJvVjQh-Y-UcX6Axlh8nDJzweNVUUOC0';
  currentPositionIcon = {
    url: './assets/images/curr-loc.png',
    scaledSize: [25, 25],
    origin: [0, 0],
    anchor: [0, 0]
  };

  /*@ngInject*/
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  $onInit() {
    this.coords = [this.ride.srcLat, this.ride.srcLng];
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

export default angular.module('taxiApp.track', [uiRouter, ngMap])
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

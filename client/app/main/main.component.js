import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    // this.requestActivationCode();
    // this.notifyMe();
  }

  requestActivationCode() {
    this.$http.get('/api/users/confirm')
      .then(response => {
        this.activationCode = response.data.activationCode;
        console.log(response.data, this.activationCode);
      });
  }

  submit() {
    this.$http.post('/api/users/confirm', {activationCode: this.code})
      .then(response => {
        console.log('res>', response.data);
      });
  }

  notifyMe() {
    let notification;
    if(Notification.permission === 'granted') {
      notification = new Notification('Reloaded!');
    } else if(Notification.permission !== 'denied') {
      Notification.requestPermission(function(permission) {
        if(permission === 'granted') {
          notification = new Notification('Reloaded!');
        }
      });
    }
  }
}

export default angular.module('taxiApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
    controllerAs: 'vm'
  })
  .name;

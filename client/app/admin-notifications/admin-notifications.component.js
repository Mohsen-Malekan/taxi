import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './admin-notifications.routes';
import 'angular-socket-io';

class AdminNotificationsController {
  /*@ngInject*/
  constructor($http, socket) {
    this.$http = $http;
    this.socket = socket;

    socket.socket.emit('CALL', 'client');

    socket.socket.on('CALL_BACK', data => {
      console.log('CALL_BACK>', data);
    });
  }

  $onDestroy() {
    this.socket.socket.removeAllListeners();
  }

  register(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.$http.post('api/users/admin', this.user)
        .then(() => {
          this.submitted = false;
          form.$setPristine();
          this.user = {
            name: '',
            mobile: '',
            password: ''
          };
        })
        .catch(err => {
          err = err.data;
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }
}

export default angular.module('taxiApp.admin.notifications', [uiRouter, 'btford.socket-io'])
  .config(routing)
  .component('adminNotifications', {
    template: require('./admin-notifications.html'),
    controller: AdminNotificationsController,
    controllerAs: 'vm'
  })
  .name;

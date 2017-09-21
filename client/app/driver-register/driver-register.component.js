import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './driver-register.routes';

class DriverRegisterController {
  user = {
    name         : '',
    mobile       : '',
    nationalCode : '',
    email        : ''
  };

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  register(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.$http.post('/api/users/driver', {
        name         : this.user.name,
        mobile       : this.user.mobile,
        nationalCode : this.user.nationalCode,
        email        : this.user.email,
        password     : 'zxcv123fdsa654qwer789'
      })
        .then(() => {
          // Account created, redirect to home
          console.log('created!');
          this.user = {
            name         : '',
            mobile       : '',
            nationalCode : '',
            email        : ''
          };
          this.submitted = false;
          form.$setPristine();
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

export default angular.module('taxiApp.admin.driver.register', [uiRouter])
  .config(routing)
  .component('driverRegister', {
    template     : require('./driver-register.html'),
    controller   : DriverRegisterController,
    controllerAs : 'vm'
  })
  .name;

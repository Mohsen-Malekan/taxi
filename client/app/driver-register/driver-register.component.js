import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './driver-register.routes';
import ngFileUpload from 'ng-file-upload';

class DriverRegisterController {
  user = {
    name: '',
    mobile: '',
    nationalCode: '',
    accountNumber: '',
    email: '',
    photos: []
  };

  /*@ngInject*/
  constructor($http, Upload) {
    this.$http = $http;
    this.Upload = Upload;
  }

  register(form) {
    this.submitted = true;
    this.user.password = 'zxcv123fdsa654qwer789';

    if(form.$valid) {
      this.Upload.upload({
        url: 'api/users/driver',
        data: this.user,
      })
        .then(() => {
          this.user = {
            name: '',
            mobile: '',
            nationalCode: '',
            accountNumber: '',
            email: '',
            photos: []
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

export default angular.module('taxiApp.admin.driver.register', [uiRouter, ngFileUpload])
  .config(routing)
  .component('driverRegister', {
    template: require('./driver-register.html'),
    controller: DriverRegisterController,
    controllerAs: 'vm'
  })
  .name;

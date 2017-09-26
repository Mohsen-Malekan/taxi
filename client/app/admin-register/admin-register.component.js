import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './admin-register.routes';
import ngFileUpload from 'ng-file-upload';

class AdminRegisterController {
  user = {
    name     : '',
    mobile   : '',
    password : ''
  };
  errors = {};
  submitted = false;
  test = '';


  /*@ngInject*/
  constructor(Auth, $state) {
    this.$http = Auth;
    this.$state = $state;
  }

  register(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.$http.createUser({
        name     : this.user.name,
        mobile   : this.user.mobile,
        password : this.user.password,
        role     : 'admin'
      })
        .then(() => {
          this.user = {
            name     : '',
            mobile   : '',
            password : ''
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

export default angular.module('taxiApp.admin.register', [uiRouter])
  .config(routing)
  .component('adminRegister', {
    template     : require('./admin-register.html'),
    controller   : AdminRegisterController,
    controllerAs : 'vm'
  })
  .name;

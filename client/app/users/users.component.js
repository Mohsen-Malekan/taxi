import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './users.routes';

class UsersController {
  users = [];
  /*@ngInject*/
  constructor($http, $httpParamSerializerJQLike, $stateParams, $state, Auth) {
    this.$http = $http;
    this.$hps = $httpParamSerializerJQLike;
    this.$stateParams = $stateParams;
    this.Auth = Auth;
    this.$state = $state;
    this.role = this.$stateParams.role;
  }

  $onInit() {
    this.Auth.hasRole('sysAdmin')
      .then(has => {
        if(this.$stateParams.role === 'admin' && !has) {
          return this.$state.go('main');
        }
      });
  }

  toggleActivation(user) {
    return this.$http.get(`api/users/toggleActivation/${user._id}`);
    // .then(() => user.active = !user.active);
  }

  remove(user) {
    return this.$http.delete(`api/users/${user._id}`)
      .then(() => this.users.splice(this.users.indexOf(user)));
  }

  callServer(tableState) {
    this.$parent.vm.isLoading = true;
    tableState.search = _.merge(tableState.search, {predicateObject: {role: this.$parent.vm.$stateParams.role}});

    if(_.has(tableState, 'search.predicateObject.date')) {
      _.set(tableState, 'search.predicateObject.date', '2017-09-30T22:22:48.627Z');
    }

    this.$parent.vm.$http.get(`api/users?${this.$parent.vm.$hps(tableState)}`).then(result => {
      this.$parent.vm.users = result.data.data;
      tableState.pagination.numberOfPages = result.data.numberOfPages;
      this.$parent.vm.isLoading = false;
    });
  }
}

export default angular.module('taxiApp.admin.users', [uiRouter])
  .config(routing)
  .component('users', {
    template: require('./users.html'),
    controller: UsersController,
    controllerAs: 'vm'
  })
  .name;

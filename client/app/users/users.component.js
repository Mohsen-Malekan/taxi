import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './users.routes';

class UsersController {
  users = [];
  /*@ngInject*/
  constructor($http, $httpParamSerializerJQLike, $stateParams) {
    this.$http = $http;
    this.$hps = $httpParamSerializerJQLike;
    this.$stateParams = $stateParams;
  }

  delete(user) {
    return this.$http.delete(`api/users/${user._id}`)
      .then(() => user.active = false);
  }

  callServer(tableState) {
    this.$parent.vm.isLoading = true;
    tableState.search = _.merge(tableState.search, { predicateObject : { role : this.$parent.vm.$stateParams.role } });

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
    template     : require('./users.html'),
    controller   : UsersController,
    controllerAs : 'vm'
  })
  .name;

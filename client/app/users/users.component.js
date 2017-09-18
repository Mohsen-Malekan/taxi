import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './users.routes';

class UsersController {
  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    console.log('users> ', this.users);
  }

  callServer(tableState) {
    this.$parent.vm.isLoading = true;

    let pagination = tableState.pagination;
    let start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    let number = pagination.number || 10;  // Number of entries showed per page.

    this.$parent.vm.$http.get(`api/users?${tableState}`).then(result => {
      console.log('res> ', result);
      this.$parent.vm.isLoading = false;
    });

    // service.getPage(start, number, tableState).then(result => {
    //   this.displayed = result.data;
    //   tableState.pagination.numberOfPages = result.numberOfPages;// set the number of pages so the pagination can update
    //   this.isLoading = false;
    // });
  }
}

export default angular.module('taxiApp.admin.users', [uiRouter])
  .config(routing)
  .component('users', {
    template     : require('./users.html'),
    controller   : UsersController,
    controllerAs : 'vm',
    bindings     : {
      users : '<'
    }
  })
  .name;

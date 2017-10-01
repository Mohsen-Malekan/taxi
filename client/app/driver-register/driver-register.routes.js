'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.driver', {
      url: '/driver',
      template: '<ui-view></ui-view>',
      abstract: true
    })
    .state('admin.driver.register', {
      url: '/register',
      template: '<driver-register></driver-register>',
      authenticate: 'admin'
    });
}

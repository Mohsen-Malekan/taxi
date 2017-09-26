'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.users', {
      url: '/users/{role:user|driver|admin}',
      template: '<users></users>',
      authenticate: 'admin'
    });
}

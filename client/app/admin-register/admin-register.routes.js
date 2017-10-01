'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.register', {
      url: '/register',
      template: '<admin-register></admin-register>',
      authenticate: 'sysAdmin'
    });
}

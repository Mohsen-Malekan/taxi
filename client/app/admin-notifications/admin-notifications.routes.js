'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.notifications', {
      url: '/notifications',
      template: '<admin-notifications></admin-notifications>',
      authenticate: 'admin'
    });
}

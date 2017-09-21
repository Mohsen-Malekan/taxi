'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.reports', {
      url          : '/reports',
      template     : '<reports></reports>',
      authenticate : 'admin'
    });
}

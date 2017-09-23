export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.reports', {
      url          : '/reports/:type',
      template     : '<reports></reports>',
      authenticate : 'admin'
    });
}

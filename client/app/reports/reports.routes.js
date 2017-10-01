export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.reports', {
      url: '/reports',
      // abstract: true,
      template: '<reports></reports>',
      authenticate: 'admin'
    });
}

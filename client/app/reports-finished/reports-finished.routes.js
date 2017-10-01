export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.reports.finished', {
      url: '/finished',
      template: '<reports-finished></reports-finished>',
      authenticate: 'admin'
    });
}

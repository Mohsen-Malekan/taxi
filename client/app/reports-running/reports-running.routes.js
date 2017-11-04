export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.reports.running', {
      url: '/running',
      template: '<reports-running></reports-running>',
      authenticate: 'admin'
    });
}

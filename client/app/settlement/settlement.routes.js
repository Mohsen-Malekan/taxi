export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.settlement', {
      url          : '/settlement',
      template     : '<settlement></settlement>',
      authenticate : 'admin'
    });
}

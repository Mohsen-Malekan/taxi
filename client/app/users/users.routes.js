'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('admin.users', {
      url          : '/users',
      template     : '<users users="$resolve.users.data"></users>',
      authenticate : 'admin',
      resolve      : {
        /*@ngInject*/
        users : $http => $http.get('api/users')
          .catch(() => undefined)
      }
    });
}

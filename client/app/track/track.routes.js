'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('track', {
      url      : '/track/:id',
      template : '<track ride="$resolve.ride"/>',
      resolve  : {
        /*@ngInject*/
        ride : ($http, $stateParams) => {
          return $http.get(`api/rides/${$stateParams.id}`)
            .catch(() => undefined);
        }
      }
    });
}

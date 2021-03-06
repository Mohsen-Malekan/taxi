'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('track', {
      url: '/track/:id',
      template: '<track ride="$resolve.ride.data"/>',
      resolve: {
        /*@ngInject*/
        ride: ($http, $stateParams) => $http.get(`api/rides/${$stateParams.id}`)
          .catch(() => undefined)
      }
    });
}

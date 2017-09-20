'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export default angular.module('directives.pagination', [])
  .directive('pageSelect', function() {
    return {
      restrict : 'E',
      template : '<input class="select-page form-control input-sm" ng-model="inputPage" ng-max="{{currentPage}}" ng-change="selectPage(inputPage)">',
      link(scope, element, attrs) {
        scope.$watch('currentPage', function(c) {
          scope.inputPage = c;
        });
      }
    };
  })
  .name;

'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-validation-match';
import loadingBar from 'angular-loading-bar';
import 'angular-ui-switch/angular-ui-switch.min';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import pagination from '../components/pagination/pagination.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import track from './track/track.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.css';

angular.module('taxiApp', [ngCookies, ngResource, ngSanitize, uiRouter, uiBootstrap, loadingBar, 'uiSwitch', _Auth, account,
  socket, admin, 'validation.match', navbar, pagination, footer, main, constants, util, track
])
  .config(routeConfig)
  .directive('mongooseError', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link(scope, element, attrs, ngModel) {
        element.on('keydown', () => ngModel.$setValidity('mongoose', true));
      }
    };
  })
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['taxiApp'], {
      strictDi: true
    });
  });

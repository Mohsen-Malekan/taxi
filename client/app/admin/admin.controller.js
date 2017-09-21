'use strict';
import angular from 'angular';
import _ from 'lodash';

export default class AdminController {
  /*@ngInject*/
  constructor($state) {
    this.$state = $state;
    this.tabs = [
      {
        title : 'ثبت راننده',
        state : 'admin.driver.register',
        icon  : 'fa fa-user-plus',
        url   : '/admin/driver/register'
      },
      {
        title : 'کاربران',
        state : {
          name  : 'admin.users',
          param : {
            role : 'user'
          }
        },
        icon : 'fa fa-users',
        url  : '/admin/users/user'
      },
      {
        title : 'راننده ها',
        state : {
          name  : 'admin.users',
          param : {
            role : 'driver'
          }
        },
        icon : 'fa fa-taxi',
        url  : '/admin/users/driver'
      },
      {
        title : 'گزارشات',
        state : 'admin.reports',
        icon  : 'fa fa-database',
        url   : '/admin/reports'
      }
    ];
  }

  $onInit() {
    let url = this.$state.href(this.$state.current.name, this.$state.params);
    this.active = _.findIndex(this.tabs, {url});
  }

  changeState(state) {
    if(angular.isString(state)) {
      this.$state.go(state);
    } else if(angular.isObject(state)) {
      this.$state.go(state.name, state.param);
    }
  }
}

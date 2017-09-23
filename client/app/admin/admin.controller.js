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
        title : 'اعلان ها',
        state : 'admin.notifications',
        icon  : 'fa fa-bell',
        url   : '/admin/notifications'
      }
    ];
  }

  $onInit() {
    let url = this.$state.href(this.$state.current.name, this.$state.params);
    let index = _.findIndex(this.tabs, {url});
    this.active = index === -1 ? 4 : index;
  }

  changeState(state) {
    if(angular.isString(state)) {
      this.$state.go(state);
    } else if(angular.isObject(state)) {
      this.$state.go(state.name, state.param);
    }
  }

  changeState2(state, type) {
    this.$state.go(state, {type});
  }
}

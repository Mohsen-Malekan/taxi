'use strict';
import angular from 'angular';

export default class AdminController {
  /*@ngInject*/
  constructor($state) {
    this.$state = $state;
    // this.users = User.query();
    this.tabs = [
      {
        title : 'ثبت راننده',
        state : 'admin.driver.register',
        icon  : 'user-plus'
      },
      {
        title : 'کاربران',
        state : {
          name  : 'admin.users',
          param : {
            type : 'user'
          }
        },
        icon : 'users'
      },
      {
        title : 'راننده',
        state : 'main',
        icon  : 'user'
      }
    ];
  }

  changeState(state) {
    if(angular.isString(state)) {
      this.$state.go(state);
    }
    else if(angular.isObject(state)) {
      this.$state.go(state.name, state.param);
    }
  }
}

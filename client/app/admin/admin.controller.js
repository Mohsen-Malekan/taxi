'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor($state) {
    this.$state = $state;
    // this.users = User.query();
    this.tabs = [
      {
        title : 'ثبت راننده',
        state : 'admin.driver.register',
        icon  : 'user'
      },
      {
        title : 'ثبت',
        state : 'admin.test',
        icon  : 'user'
      },
      {
        title : 'راننده',
        state : 'main',
        icon  : 'user'
      }
    ];
  }

  changeState(state) {
    this.$state.go(state);
  }

  // delete(user) {
  //   user.$remove();
  //   this.users.splice(this.users.indexOf(user), 1);
  // }
}

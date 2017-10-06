/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Ride from '../api/ride/ride.model';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    /*Thing.find({}).remove()
      .then(() => {
        let thing = Thing.create({
          name: 'Development Tools',
          info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, '
                + 'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, '
                + 'Stylus, Sass, and Less.'
        }, {
          name: 'Server and Client integration',
          info: 'Built with a powerful and fun stack: MongoDB, Express, '
                + 'AngularJS, and Node.'
        }, {
          name: 'Smart Build System',
          info: 'Build system ignores `spec` files, allowing you to keep '
                + 'tests alongside code. Automatic injection of scripts and '
                + 'styles into your index.html'
        }, {
          name: 'Modular Structure',
          info: 'Best practice client and server structures allow for more '
                + 'code reusability and maximum scalability'
        }, {
          name: 'Optimized Build',
          info: 'Build process packs up your templates as a single JavaScript '
                + 'payload, minifies your scripts/css/images, and rewrites asset '
                + 'names for caching.'
        }, {
          name: 'Deployment Ready',
          info: 'Easily deploy your app to Heroku or Openshift with the heroku '
                + 'and openshift subgenerators'
        });
        return thing;
      })
      .then(() => console.log('finished populating things'))
      .catch(err => console.log('error populating things', err));*/

    Ride.find({}).remove()
      .then(() => User.findOne({role: 'user'}))
      .then(user => {
        User.findOne({role: 'driver'})
          .then(driver => Ride.create(
            {
              driver: driver.id,
              user: user.id,
              date: Date.now(),
              status: 'finished',
              cost: Math.floor(Math.random() * (15000 - 3000) + 3000)
            },
            {
              driver: driver.id,
              user: user.id,
              date: Date.now(),
              status: 'finished',
              cost: Math.floor(Math.random() * (15000 - 3000) + 3000)
            },
            {
              driver: driver.id,
              user: user.id,
              date: Date.now(),
              status: 'finished',
              cost: Math.floor(Math.random() * (15000 - 3000) + 3000)
            },
            {
              driver: driver.id,
              user: user.id,
              date: Date.now(),
              status: 'finished',
              cost: Math.floor(Math.random() * (15000 - 3000) + 3000)
            },
            {
              driver: driver.id,
              user: user.id,
              date: Date.now(),
              status: 'finished',
              cost: Math.floor(Math.random() * (15000 - 3000) + 3000)
            })
          );
      })
      .then(() => console.log('finished populating rides'))
      .catch(err => console.log('error populating rides', err));

    User.find({role: config.userRoles[config.userRoles.length - 1]})
      .then(users => {
        if(!users || !users.length) {
          User.create({
            provider: 'local',
            name: 'sysAdmin',
            email: 'sys.admin@mail.com',
            mobile: '09363261694',
            nationalCode: '0946428611',
            password: 'zaq1`xsw21',
            role: config.userRoles[config.userRoles.length - 1],
            active: true
          });
        }
      })
      .then(() => console.log('user \'sysAdmin\' added'))
      .catch(err => console.log('error adding user \'sysAdmin\'', err));
  }
}

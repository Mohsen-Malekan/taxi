/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Ride from '../api/ride/ride.model';
import config from './environment/';

const places = [
  [36.298567, 59.509377], //home 0
  [36.302980, 59.570974], //rahnamaei 1
  [36.290581, 59.594117], //work 2
  [36.297918, 59.605950], //shohada 3
  [36.326152, 59.534748], //azadshahr 4
  [36.321188, 59.630589], //gaaz 5
  [36.358072, 59.515948], //azad uni 6
  [36.329960, 59.493394], //sadaf 7
  [36.336190, 59.512800], //daneshamooz 8
  [36.310465, 59.513310], //kowsar 9
  [36.305993, 59.500004], //hashemiye 10
];

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

    // User.findOne({role: 'sysAdmin'}).remove()
    //   .then(() => User.create(
    //     {
    //       name: 'sysAdmin',
    //       email: 'sysAdmin@mail.com',
    //       mobile: '09363261694',
    //       nationalCode: '0946428611',
    //       password: 'zaq1`xsw21',
    //       role: 'sysAdmin',
    //       active: true
    //     },
    //     {
    //       name: 'admin1',
    //       email: 'admin1@mail.com',
    //       mobile: '09157662543',
    //       nationalCode: '0946428612',
    //       password: 'zaq1`xsw21',
    //       role: 'admin',
    //       active: true
    //     },
    //     {
    //       name: 'driver1',
    //       email: 'driver1@mail.com',
    //       mobile: '09127559707',
    //       nationalCode: '0946428613',
    //       password: 'zaq1`xsw21',
    //       role: 'driver',
    //       active: true
    //     },
    //     {
    //       name: 'user1',
    //       email: 'user1@mail.com',
    //       mobile: '09399690121',
    //       nationalCode: '0946428614',
    //       password: 'zaq1`xsw21',
    //       role: 'user',
    //       active: true
    //     }
    //   ))
    //   .then(() => console.log('users added'))
    //   .catch(err => console.log('error adding users', err));

    // Ride.find({}).remove()
    //   .then(() => User.findOne({role: 'user'}))
    //   .then(user => User.findOne({role: 'driver'})
    //     .then(driver => {
    //       let rides = [];
    //       for(let i = 0; i < 100; i++) {
    //         let srcIndex = Math.floor(Math.random() * 11);
    //         let locIndex = (srcIndex + 4 + i) % 11;
    //         let desIndex = (srcIndex + 8 + i) % 11;
    //         rides.push({
    //           driver: driver.id,
    //           user: user.id,
    //           src: {
    //             type: 'Point',
    //             coordinates: places[srcIndex]
    //           },
    //           loc: {
    //             type: 'Point',
    //             coordinates: places[locIndex]
    //           },
    //           des: [{
    //             type: 'Point',
    //             coordinates: places[desIndex]
    //           }],
    //           distance: 0,
    //           date: new Date(),
    //           arrivedAt: new Date(),
    //           startAt: new Date(),
    //           finishedAt: new Date(),
    //           duration: 0,
    //           cost: Math.floor(Math.random() * (17000 - 3500) + 3500),
    //           paymentMethod: config.paymentMethods[Math.floor(Math.random() * 2)],
    //           rate: 10,
    //           description: '',
    //           status: config.rideStatus[Math.floor(Math.random() * 6)],
    //           isSettled: false,
    //           subscribers: []
    //         });
    //       }
    //       return Ride.collection.insert(rides);
    //     }))
    //   .then(() => console.log('finished populating rides'))
    //   .catch(err => console.log('error populating rides', err));
  }
}

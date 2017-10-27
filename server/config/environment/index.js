'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

/*function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}*/

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'taxi-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      useMongoClient: true,
      db: {
        safe: true
      }
    }
  },

  google: {
    clientID: process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/google/callback`
  },

  SMS_API: 'https://api.kavenegar.com/v1/7879382B54572F574B4E6C3832754934355048687A773D3D/sms/',

  gcm_driver: 'AAAAJ0RBioc:APA91bEV4CN4HO7ViIv827m1uWnXhR6RdBsiU2Hrr0ZVX0LJdkQW0ULZfW3acII4fqYYL87z8dile-5IUKATbCjynYWLTiqhaizYiaDEjSsRJbgtn6JuFpiXxeQVUQrqTIAMjUGarl6k',

  gcm_user: 'AAAAGWLSfjM:APA91bHpXuRj4Y1wSnbqNFEmCmNuej4GUNHnrye1D3ZwiuJzi7db0KlJaHlpFZ_Hf5oMLqsaBSOSQsjZusPu5iVPjuj-nbAMVUqawAZ_jEYOqvA4Jd1G82GMFJtPDUBJerXjHQuLFJAd'
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {});

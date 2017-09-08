'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {registerEvents} from './user.events';

const authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    required() {
      return authTypes.indexOf(this.provider) === -1;
    }
  },
  mobile: {
    type: String,
    lowercase: true,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    required() {
      return authTypes.indexOf(this.provider) === -1;
    }
  },
  active: {type: Boolean, default: false},
  activationCode: String,
  lastState: String,
  lastLat: Number,
  lastLng: Number,
  asset: Number,
  sharingCode: String,
  challengerCode: String,
  lastLogin: String,
  provider: String,
  salt: String,
  google: {},
  github: {}
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role
    };
  });

// UserSchema
//   .virtual('id')
//   .get(function() {
//     return this._id;
//   });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'Password cannot be blank');

// Validate empty mobile
UserSchema
  .path('mobile')
  .validate(function(mobile) {
    return mobile.length;
  }, 'mobile cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }

    return this.constructor.findOne({ email: value }).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

// Validate mobile is not taken
UserSchema
  .path('mobile')
  .validate(function(value) {
    return this.constructor.findOne({ mobile: value }).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified mobile number is already in use.');

// Validate sharingCode is not taken
UserSchema
  .path('sharingCode')
  .validate(function(value) {
    return this.constructor.findOne({ sharingCode: value }).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The sharingCode is not valid.');

// Validate mobile is valid
UserSchema
  .path('mobile')
  .validate(function(mobile) {
    return mobile.match(/^(09)[0-9]{9}$/);
  }, 'The specified mobile number is not valid');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if(!this.isModified('password')) {
      return next();
    }

    if(!validatePresenceOf(this.password)) {
      if(authTypes.indexOf(this.provider) === -1) {
        return next(new Error('Invalid password'));
      } else {
        return next();
      }
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if(saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if(encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        return next();
      });
    });
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if(err) {
        return callback(err);
      }

      if(this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(...args) {
    let byteSize;
    let callback;
    let defaultByteSize = 16;

    if(typeof args[0] === 'function') {
      callback = args[0];
      byteSize = defaultByteSize;
    } else if(typeof args[1] === 'function') {
      callback = args[1];
    } else {
      throw new Error('Missing Callback');
    }

    if(!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if(!password || !this.salt) {
      if(!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if(!callback) {
      // eslint-disable-next-line no-sync
      return crypto.pbkdf2Sync(password, salt, defaultIterations,
          defaultKeyLength, 'sha1')
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength,
      'sha1', (err, key) => {
        if(err) {
          return callback(err);
        } else {
          return callback(null, key.toString('base64'));
        }
      });
  }
};

registerEvents(UserSchema);
export default mongoose.model('User', UserSchema);

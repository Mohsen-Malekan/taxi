'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import randomstring from 'randomstring';
import {registerEvents} from './user.events';
import shared from '../../config/environment/shared';
import _ from 'lodash';

const authTypes = ['github', 'twitter', 'facebook', 'google'];
const DEFAULT_PASS = 'zxcv123fdsa654qwer789';

let UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    required: false
  },
  mobile: {
    type: String,
    lowercase: true,
    required: true
  },
  nationalCode: {
    type: String,
    required: false
  },
  accountNumber: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'user',
    enum: shared.userRoles
  },
  password: {
    type: String,
    required: true,
    default: DEFAULT_PASS
  },
  date: {
    type: Date,
    default: Date.now()
  },
  asset: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    min: 0,
    max: 10,
    default: 10
  },
  active: {
    type: Boolean,
    default: false
  },
  driverState: {
    type: String,
    default: shared.driverStates.off
  },
  appId: {
    type: String,
    default: ''
  },
  location: {
    name: String,
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    },
  },
  plate: {
    type: String,
    default: ''
  },
  activationCode: {
    type: String,
    default: randomstring.generate({
      length: 5,
      charset: 'numeric'
    }).toString()
  },
  sharingCode: {
    type: String,
    default: randomstring.generate(6).toUpperCase()
  },
  challengerCode: {
    type: String,
    default: ''
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  provider: {
    type: String,
    default: 'local'
  },
  salt: String
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

// return userFields
UserSchema
  .virtual('userInfo')
  .get(function() {
    return _.pick(this, shared.userFields);
  });

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
  }, 'رایانامه را وارد کنید');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'گذرواژه را وارد کنید');

// Validate empty mobile
UserSchema
  .path('mobile')
  .validate(function(mobile) {
    return mobile.length;
  }, 'شماره موبایل را وارد کنید');

// Validate empty nationalCode
UserSchema
  .path('nationalCode')
  .validate(function(nationalCode) {
    return nationalCode.length;
  }, 'کد ملی را وارد کنید');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    if(!this.email) {
      return true;
    }

    return this.constructor.findOne({email: value}).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'رایانامه تکراری است.');

// Validate mobile is not taken
UserSchema
  .path('mobile')
  .validate(function(value) {
    return this.constructor.findOne({mobile: value}).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'شماره موبایل تکراری است.');

// Validate nationalCode is not taken
UserSchema
  .path('nationalCode')
  .validate(function(value) {
    if(!this.nationalCode) {
      return true;
    }
    return this.constructor.findOne({nationalCode: value}).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'کد ملی تکراری است.');

// Validate sharingCode is not taken
UserSchema
  .path('sharingCode')
  .validate(function(value) {
    if(_.isEmpty(value)) {
      return true;
    }
    return this.constructor.findOne({sharingCode: value}).exec()
      .then(user => {
        if(user) {
          return this.id === user.id;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'کد معرفی تکراری است.');

// Validate mobile is valid
UserSchema
  .path('mobile')
  .validate(function(mobile) {
    return mobile.match(/^(09)[0-9]{9}$/);
  }, 'شماره موبایل نامعتبر است');

let validatePresenceOf = function(value) {
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

    let defaultIterations = 10000;
    let defaultKeyLength = 64;
    let salt = new Buffer(this.salt, 'base64');

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

UserSchema.statics.findByIdAndToggle = function(id, prop = 'active') {
  return this.findById(id).exec()
    .then(user => {
      user[prop] = !user[prop];
      return user.save();
    });
};

UserSchema.index({location: '2dsphere'});
registerEvents(UserSchema);
export default mongoose.model('User', UserSchema);

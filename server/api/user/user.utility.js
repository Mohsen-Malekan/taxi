import request from 'request-promise-native';
import gcm from 'node-gcm';
import config from '../../config/environment';
import _ from 'lodash';

let senderDriver = new gcm.Sender(config.gcm_driver);
let senderUser = new gcm.Sender(config.gcm_user);

export function sendSMS(user) {
  let msg = `کاربر گرامی (${user.name})\n\nکد فعال سازی شما:${user.activationCode}`;
  let smsUrl = `${config.SMS_API}send.json?receptor=${user.mobile}&sender=10004346&message=${encodeURI(msg)}`;
  request(smsUrl);
  return Promise.resolve(user);
}

export function sendNotifDriver(data, appIds, key) {
  data.key = key;
  let message = new gcm.Message({
    collapseKey: 'taxi',
    delayWhileIdle: true,
    timeToLive: 3,
    data
  });
  console.log('driver->>>>>>>>>>>> ', JSON.stringify(data));
  console.log('driver->>>>>>>>>>>> ', JSON.stringify(key));
  console.log('driver->>>>>>>>>>>> ', JSON.stringify(message));
  senderDriver.send(message, appIds, 1, (err, result) => {
    if(err) console.log('gcm-driver-error> ', err);
    else console.log('gcm-driver-result> ', result);
  });
  Reflect.deleteProperty(data, 'key');
  return data;
}

export function sendNotifUser(data, appIds, key) {
  data.key = key;
  let message = new gcm.Message({
    collapseKey: 'taxi',
    delayWhileIdle: true,
    timeToLive: 3,
    data
  });
  console.log('-user->>>>>>>>>>>> ', JSON.stringify(data));
  console.log('-user->>>>>>>>>>>> ', JSON.stringify(key));
  console.log('-user->>>>>>>>>>>> ', JSON.stringify(message));
  senderUser.send(message, appIds, 1, (err, result) => {
    if(err) console.log('gcm-user-error> ', err);
    else console.log('gcm-user-result> ', result);
  });
  Reflect.deleteProperty(data, 'key');
  return data;
}

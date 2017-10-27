import request from 'request-promise-native';
import gcm from 'node-gcm';
import config from '../../config/environment';

let senderDriver = new gcm.Sender(config.gcm_driver);
let senderUser = new gcm.Sender(config.gcm_user);

export function sendSMS(user) {
  let msg = `کاربر گرامی(${user.name})، کد فعال سازی شما:\n${user.activationCode}`;
  let smsUrl = `${config.SMS_API}send.json?receptor=${user.mobile}&sender=10004346&message=${msg}`;
  request(smsUrl);
  return user;
}

export function sendNotifDriver(data, appIds) {
  let message = new gcm.Message({
    collapseKey: 'taxi',
    delayWhileIdle: true,
    timeToLive: 3,
    data
  });
  senderDriver.send(message, appIds, 1, (err, result) => {
    if(err) console.log('gcm-driver-error> ', err);
    else console.log('gcm-driver-result> ', result);
  });
  return data;
}

export function sendNotifUser(data, appIds) {
  let message = new gcm.Message({
    collapseKey: 'taxi',
    delayWhileIdle: true,
    timeToLive: 3,
    data
  });
  senderUser.send(message, appIds, 1, (err, result) => {
    if(err) console.log('gcm-user-error> ', err);
    else console.log('gcm-user-result> ', result);
  });
  return data;
}

import request from 'request';

const SMS_API = 'https://api.kavenegar.com/v1/7879382B54572F574B4E6C3832754934355048687A773D3D/sms/';

export function sendSMS(user) {
  let smsUrl = `${SMS_API}send.json?receptor=${user.mobile}&sender=10004346&message=${user.activationCode}`;
  request(smsUrl, error => {
    if(error) {
      console.log(`sms error>>> userId: ${user.id}\nerror: ${error}`);
      return Promise.reject(error);
    }
    return Promise.resolve(user);
  });
}

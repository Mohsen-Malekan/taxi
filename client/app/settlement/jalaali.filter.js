'ngInject';

import moment from 'moment-jalaali';

moment.loadPersian({dialect: 'persian-modern'});

export default function jalaali() {
  return function(date, format, isUTC) {
    if(!date) {
      return '';
    }
    if(isUTC) {
      return moment(date).utc()
        .format(format);
    }
    return moment(date).format(format || 'jYYYY/jMM/jDD');
  };
}

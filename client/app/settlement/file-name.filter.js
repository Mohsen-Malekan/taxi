'ngInject';

import moment from 'moment-jalaali';

export default function fileName() {
  return function(date) {
    return moment(date).format('jYYYY-jMM-jDD_HH-mm-ss');
  };
}

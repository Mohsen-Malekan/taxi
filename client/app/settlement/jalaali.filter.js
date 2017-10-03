export default function jalaali() {
  return function(date, format, isUTC) {
    'ngInject';
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

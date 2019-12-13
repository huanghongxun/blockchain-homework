import * as moment from 'moment';

export function normalizeDateFormat(date: string) {
  return moment(date).format('YYYY-MM-DD');
}

export function normalizeDateTimeFormat(date: string) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

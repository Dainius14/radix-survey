export function timestampToHumanISODate(timestamp: number) {
  const pad = (number: number) => number < 10 ? '0' + number : number.toString();
  
  const date = new Date(timestamp);
  return date.getUTCFullYear() +
      '-' + pad(date.getUTCMonth() + 1) +
      '-' + pad(date.getUTCDate()) +
      ' ' + pad(date.getUTCHours()) +
      ':' + pad(date.getUTCMinutes()) +
      ':' + pad(date.getUTCSeconds());
};

export function random() {
  return parseInt(Math.random().toString().substring(2)).toString(36).substring(0, 7);
}

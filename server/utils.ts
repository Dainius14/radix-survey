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

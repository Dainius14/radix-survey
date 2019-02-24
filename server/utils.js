module.exports.random = function() {
  return parseInt(Math.random().toString().substring(2)).toString(36).substring(0, 7);
}

module.exports.timestampToHumanISODate = function(timestamp) {
  const pad = (number) => number < 10 ? '0' + number : number;
  const date = new Date(timestamp);
  return date.getUTCFullYear() +
      '-' + pad(date.getUTCMonth() + 1) +
      '-' + pad(date.getUTCDate()) +
      ' ' + pad(date.getUTCHours()) +
      ':' + pad(date.getUTCMinutes()) +
      ':' + pad(date.getUTCSeconds());
};

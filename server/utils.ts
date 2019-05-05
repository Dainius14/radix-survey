import bcrypt from 'bcrypt';
import { Survey } from "./types";

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


export function hashPassword(survey: Survey) {
  const newSurvey = { ...survey };
  delete newSurvey.resultsPassword;
  var salt = bcrypt.genSaltSync(5);
  var hash = bcrypt.hashSync(survey.resultsPassword, salt);
  return { ...newSurvey, resultsPasswordHashed: hash};
  
}
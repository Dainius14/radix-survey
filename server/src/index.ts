
import bcrypt from 'bcrypt';
import logger from './logger';
import RadixAPI from './radixApi';
import key from '../key.json'
import restify from 'restify';
import { InvalidContentError, NotFoundError, BadRequestError } from 'restify-errors';
import { SurveyVisibility, Survey, ResultsVisibility, SurveyType, Response } from './types';
import SurveyController from './surveyController';

const server = restify.createServer();


/**
 * Returns survey list.
 */
server.get('/api/surveys', (req, res, next) => {
  res.send(surveyController.getPublicSurveys());
  return next();
});


/**
 * Returns a single survey. 
 */
server.get('/api/surveys/:survey_id', (req, res, next) => {
  const survey = surveyController.getSurveyById(req.params.survey_id);
  if (!survey) {
    return next(new NotFoundError());
  }
  res.send(survey);
  return next();
});

/**
 * Creates new survey.
 */
server.post('/api/surveys', async (req, res, next) => {
  try {
    const id = await surveyController.createSurvey(req.body);
    res.send({ id });
    next();
  }
  catch (error) {
    if (error instanceof RangeError) {
      logger.warn(`server.post./api/surveys.invalid_survey  [Error: ${error.message}]`);
      return next(new BadRequestError(error.message));
    }
  }
});




// Apply middleware
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.fullResponse());
// For POST methods, require application/json header
server.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return next(new InvalidContentError(`Expecting 'application/json'`));
  }
  return next();
})

if (process.env.NODE_ENV !== 'production') {
  const corsMiddleware = require('restify-cors-middleware');
  const cors = corsMiddleware({ allowHeaders: ['Content-Type', 'Authorization'] });
  server.pre(cors.preflight);
  server.use(cors.actual);

  // For dev purposes add some delay to response
  server.use((req, res, next) => {
    logger.info(`${req.method} to ${req.url}`);

    setTimeout(() => next(), 100);
  });
}

let surveyController: SurveyController;
server.listen(process.env.PORT, async function () {
  const radixApi = new RadixAPI(process.env.APP_ID as string);
  await radixApi.initialize(key, process.env.KEY_PASSWORD as string);
  surveyController = new SurveyController(radixApi);

  logger.info(`${server.name} listening at ${server.url}`);
});
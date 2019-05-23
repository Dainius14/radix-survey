
import logger from './logger';
import RadixAPI from './radixApi';
import key from '../key.json'
import restify from 'restify';
import { InvalidContentError, NotFoundError, BadRequestError, UnauthorizedError, InternalServerError } from 'restify-errors';
import SurveyController, { ItemNotFoundError, WrongResponsesPasswordError, InvalidResponseFormatError, InvalidSurveyFormatError, RepeatingResponseRadixAddress } from './surveyController';

const server = restify.createServer();


/**
 * Returns survey list.
 */
server.get('/api/surveys', async (req, res, next) => {
  try {
    res.send(await surveyController.getPublicSurveys());
    return next();
  }
  catch (error) {
    return next(new InternalServerError(error.message));
  }
});


/**
 * Returns a single survey. 
 */
server.get('/api/surveys/:survey_id', async (req, res, next) => {
  try {
    const survey = await surveyController.getSurveyById(req.params.survey_id);
    res.send(survey);
    return next();
  }
  catch (error) {
    if (error instanceof ItemNotFoundError) {
      return next(new NotFoundError(error.message));
    }
    else return next(new InternalServerError(error.message));
  }
});

/**
 * Create a new survey.
 */
server.post('/api/surveys', async (req, res, next) => {
  try {
    const id = await surveyController.createSurvey(req.body);
    res.send({ id });
    return next();
  }
  catch (error) {
    if (error instanceof RangeError) {
      logger.warn(`server.post./api/surveys.invalid_survey  [Error: ${error.message}]`);
      return next(new BadRequestError(error.message));
    }
    else return next(new InternalServerError(error.message));
  }
});

/**
 * Get responses for a survey.
 */
server.get('/api/surveys/:survey_id/responses', async (req, res, next) => {
  try {
    const survey = await surveyController.getSurveyById(req.params.survey_id as string, req.headers.authorization);
    res.send(survey);
    return next();
  }
  catch (error) {
    if (error instanceof ItemNotFoundError) {
      return next(new NotFoundError(error.message));
    }
    if (error instanceof WrongResponsesPasswordError) {
      return next(new UnauthorizedError(error.message));
    }
    else return next(new InternalServerError(error.message));
  }
});

/**
 * Submit a response to a survey.
 */
server.post('/api/surveys/:survey_id/responses', async (req, res, next) => {
  try {
    await surveyController.createResponse(req.params.survey_id as string, req.body);
    res.status(204);
    res.send();
    return next();
  }
  catch (error) {
    if (error instanceof ItemNotFoundError) {
      return next(new NotFoundError(error.message));
    }
    if (error instanceof InvalidResponseFormatError || error instanceof RepeatingResponseRadixAddress) {
      return next(new BadRequestError(error.message));
    }
    else return next(new InternalServerError(error.message));
  }
});


/**
 * Initiate purchase of responses.
 */
server.post('/api/surveys/:survey_id/responses/buy', async (req, res, next) => {
  try {
    const responses = await surveyController.buyResponses(req.params.survey_id as string, req.body.radixAddress);
    res.send(responses);
    return next();
  }
  catch (error) {
    if (error instanceof InvalidSurveyFormatError) {
      return next(new NotFoundError(error.message));
    }
    else return next(new InternalServerError(error.message));
  }
});


/**
 * Get statistics for website.
 */
server.get('/api/statistics', async (req, res, next) => {
  try {
    const stats = await surveyController.getAllStats();
    res.send(stats);
    return next();
  }
  catch (error) {
    if (error instanceof ItemNotFoundError) {
      return next(new NotFoundError(error.message));
    }
    if (error instanceof WrongResponsesPasswordError) {
      return next(new UnauthorizedError(error.message));
    }
    else return next(new InternalServerError(error.message));
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
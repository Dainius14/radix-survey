import RadixAPI from '../src/radixApi';
import assert from 'assert';
import key from '../key.json';
import SurveyController from '../src/surveyController';
import { Survey, Response } from '../src/types';


describe('SurveyController', async () => {
  let surveyController: SurveyController;


  before(function (done) {
    this.timeout(15000);
    const radixApi = new RadixAPI('dd-test-' + new Date().getTime());
    radixApi.initialize(key, process.env.KEY_PASSWORD as string);
    surveyController = new SurveyController(radixApi);
    setTimeout(() => done(), 14000);
  });

  describe('when no data exists', () => {
    
    describe('getPublicSurveys()', () => {
      let surveys: Survey[];
      it('returns an array', async () => {
        surveys = await surveyController.getPublicSurveys();
        assert.strictEqual(Array.isArray(surveys), true);
      });

      it('returns an empty array', async () => {
        surveys = await surveyController.getPublicSurveys();
        assert.strictEqual(surveys.length, 0);
      });
    })

    describe('getSurveyById()', () => {
      it('throws an error for non-existing ID', () => {
        assert.rejects(surveyController.getSurveyById('does not exist hehe'));
      });
    })

    describe('getSurveyResponses()', () => {
      let responses: Response[];
      it('returns an array', async () => {
        responses = await surveyController.getSurveyResponses('does not exist hehe');
        assert.strictEqual(Array.isArray(responses), true);
      });

      it('returns an empty array', async () => {
        responses = await surveyController.getSurveyResponses('does not exist hehe');
        assert.strictEqual(responses.length, 0);
      });
    })

  })

  const testSurveys: TestDataItem[] = [
    {
      data: {
        "title": "Survey",
        "description": "desc",
        "surveyVisibility": "public",
        "responseVisibility": "public",
        "surveyType": "free",
        "questions": [
          {
            "questionText": "Q1",
            "type": "radio",
            "required": true,
            "answerChoices": [
              {
                "answerText": "a"
              },
              {
                "answerText": "b"
              }
            ]
          }
        ]
      },
      id: undefined,
      returnedData: undefined
    },
    
    {
      data: {
        "title": "Survey",
        "description": "desc",
        "surveyVisibility": "private",
        "responseVisibility": "public",
        "surveyType": "free",
        "questions": [
          {
            "questionText": "Q1",
            "type": "radio",
            "required": true,
            "answerChoices": [
              {
                "answerText": "a"
              },
              {
                "answerText": "b"
              }
            ]
          }
        ]
      },
      id: undefined,
      returnedData: undefined
    }
  ];

  const s0 = testSurveys[0].data;
  describe(`with survey [surveyVisibility='${s0.surveyVisibility}'] [responseVisibility='${s0.responseVisibility}'] [type='${s0.surveyType}']`, () => {
    const originalSurvey = testSurveys[0].data;

    describe('createSurvey()', () => {
      
      it('should return survey ID', async function() {
        this.timeout(10000);
        testSurveys[0].id = await surveyController.createSurvey(originalSurvey);
        assert.strictEqual(typeof testSurveys[0].id, 'string');
      });
    });


    describe('getSurveyById()', () => {
      
      it('should return an object', async () => {
        const returnedSurvey = await surveyController.getSurveyById(testSurveys[0].id as string);
        testSurveys[0].returnedData = returnedSurvey;

        assert.strictEqual(typeof returnedSurvey, 'object');
      });
      
      it('should return the same survey', async () => {
        const returnedSurvey: any = testSurveys[0].returnedData;
        const theSame = Object.keys(originalSurvey).every(key => {
          if (key === 'questions') return true;

          return originalSurvey[key] === returnedSurvey[key];
        });
        assert.strictEqual(theSame, true);
      });
    });


    describe('getSurveys()', () => {
      let surveys: Survey[];
      
      it('should return an array', async () => {
        surveys = await surveyController.getPublicSurveys();
        assert.strictEqual(Array.isArray(surveys), true);
      });
      it('should return an array with 1 element', () => {
        assert.strictEqual(surveys.length, 1);
      });
      it('should return an array with given survey', () => {
        const theSame = Object.keys(testSurveys[0].data).every(key => {
          if (key === 'questions') return true;
          return testSurveys[0].data[key] === (surveys[0] as any)[key];
        });
        assert.strictEqual(theSame, true);
      });
    });

  });

  const s1 = testSurveys[1].data;
  describe(`with survey [surveyVisibility='${s1.surveyVisibility}'] [responseVisibility='${s1.responseVisibility}'] [type='${s1.surveyType}']`, () => {
    const originalSurvey = testSurveys[0].data;

    describe('createSurvey()', () => {
      
      it('should return survey ID', async function() {
        this.timeout(10000);
        testSurveys[0].id = await surveyController.createSurvey(originalSurvey);
        assert.strictEqual(typeof testSurveys[0].id, 'string');
      });
    });


    describe('getSurveyById()', () => {
      
      it('should return an object', async () => {
        const returnedSurvey = await surveyController.getSurveyById(testSurveys[0].id as string);
        testSurveys[0].returnedData = returnedSurvey;

        assert.strictEqual(typeof returnedSurvey, 'object');
      });
      
      it('should return the same survey', async () => {
        const returnedSurvey: any = testSurveys[0].returnedData;
        const theSame = Object.keys(originalSurvey).every(key => {
          if (key === 'questions') return true;

          return originalSurvey[key] === returnedSurvey[key];
        });
        assert.strictEqual(theSame, true);
      });
    });


    describe('getSurveys()', () => {
      let surveys: Survey[];
      
      it('should return an array', async () => {
        surveys = await surveyController.getPublicSurveys();
        assert.strictEqual(Array.isArray(surveys), true);
      });
      it('should return an array without given survey in it', () => {
        const contains = surveys.some(x => x.id === testSurveys[1].id)
        assert.strictEqual(contains, false);
      });
    });

  });

});


type TestDataItem = {
  data: any;
  id?: string;
  returnedData?: object;
}
  
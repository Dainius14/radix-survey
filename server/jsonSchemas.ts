// Validate at https://www.jsonschemavalidator.net/
// More info about about schemas https://ajv.js.org/keywords.html
// and https://json-schema.org/understanding-json-schema/reference/index.html
// Scheme doesn't allow other properties for survey, question and answer than what is defined in
// "properties" property for each entity.
// Required properties are defined in "required" array for each entity.
// Property types and other attributes for it are defined in "properties" for each property

export const newSurvey = {
  "type": "object",
  "required": [
    "title",
    "description",
    "resultsVisibility",
    "surveyType",
    "questions"
  ],
  "else": {
  	"additionalProperties": false,
  },
  "properties": {
    "title": {
      "type": "string",
      "minLength": 0,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "minLength": 0,
      "maxLength": 1000
    },
    "resultsVisibility": {
      "enum": [
        "public",
        "private",
        "privateForSale"
      ]
    },
    "resultsPassword": {
      "type": "string",
      "minLength": 0,
      "maxLength": 1000
    },
    "resultsPrice": {
      "type": "number",
      "min": 0
    },
    "surveyType": {
      "enum": [
        "free",
        "paid"
      ]
    },
    "radixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51
    },
    "totalReward": {
      "type": "number",
      "minValue": 0,
    },
    "firstNCount": {
      "type": "integer",
      "minValue": "1"
    },
    "randomNAfterTimeCount": {
      "type": "integer",
      "minValue": "1"
    },
    "randomNAfterTimeLength": {
      "type": "integer",
      "minValue": "1"
    },
    "randomNAfterTimeUnits": {
      "enum": ["hours", "days", "weeks"]
    },

    /*Questions*/
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "minItems": 1,
        "required": [
          "questionText",
          "type"
        ],
        "properties": {
          "questionText": {
            "type": "string"
          },
          "type": {
            "enum": [
              "radio",
              "checkbox",
              "shortText",
              "longText"
            ]
          }
        }/* If questionType is radio or checkbox, answerChoices are required with minimum item count of 2*/,
        "anyOf": [
          {
            "properties": {
              "type": {
                "enum": [
                  "radio",
                  "checkbox"
                ]
              },
              "answerChoices": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "answerText"
                  ],
                  "properties": {
                    "answerText": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "required": [
              "answerChoices"
            ]
          },
          {
            "properties": {
              "type": {
                "enum": [
                  "shortText",
                  "longText"
                ]
              },
              "answers": {
                "not": {}
              }
            }
          }
        ]
      }
    }
  }
};

export const surveyAnswers = {
  "type": "object",
  "additionalProperties": false,
  "required": [
    "surveyId",
    "userRadixAddress",
    "answers"
  ],
  "properties": {
    "surveyId": {
      "type": "string",
      "minLength": 29,
      "maxLength": 30
    },
    "userRadixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51
    },
    "answers": {
      "type": "object"
    }
  }
};

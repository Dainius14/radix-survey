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
    "surveyVisibility",
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
    "surveyVisibility": {
      "enum": [
        "public",
        "private"
      ]
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
    "resultPrice": {
      "type": "number",
      "min": 0
    },
    "surveyType": {
      "enum": [
        "free",
        "paid"
      ]
    },
    "winnerSelection": {
      "enum": [
        "firstN",
        "randomNAfterTime",
        "randomNAfterMParticipants"
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
    "winnerCount": {
      "type": "integer",
      "minValue": "1"
    },
    "requiredParticipantCount": {
      "type": "integer",
      "minValue": "1"
    },
    "winnerSelectionTimeLength": {
      "type": "integer",
      "minValue": "1"
    },
    "winnerSelectionTimeUnits": {
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
    "answers"
  ],
  "properties": {
    "radixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51
    },
    "answers": {
      "type": "object"
    }
  }
};

// Validate at https://www.jsonschemavalidator.net/
// More info about about schemas https://ajv.js.org/keywords.html
// and https://json-schema.org/understanding-json-schema/reference/index.html
// Scheme doesn't allow other properties for survey, question and answer than what is defined in
// "properties" property for each entity.
// Required properties are defined in "required" array for each entity.
// Property types and other attributes for it are defined in "properties" for each property

export const surveySchema = {
  "type": "object",
  "required": [
    "title",
    "description",
    "surveyVisibility",
    "responseVisibility",
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
    "responseVisibility": {
      "enum": [
        "public",
        "private",
        "privateForSale"
      ]
    },
    "responsePassword": {
      "type": "string",
      "minLength": 0,
      "maxLength": 1000
    },
    "responsePrice": {
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
    "payFromRadixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51
    },
    "payToRadixAddress": {
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

const s = {
  "type": "object",
  "required": [
    "title",
    "description",
    "surveyVisibility",
    "responseVisibility",
    "surveyType",
    "questions"
  ],
  "else": {
  	"additionalProperties": false
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
    "responseVisibility": {
      "enum": [
        "public",
        "private",
        "privateForSale"
      ]
    },
    "responsePassword": {
      "type": "string",
      "minLength": 0,
      "maxLength": 1000
    },
    "responsePrice": {
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
      "minValue": 0
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
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "minItems": 1,
        "required": [
          "questionText",
          "type",
          "required"
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
          },
          "required": {
              "type": "boolean"
          },
          "answetChoices": {
              "type": "array",
              "items": {
                  "type": "object",
                  "required": ["answerText"],
                  "properties": {
                      "answerText": {
                          "type": "string"
                      }
                  }
              }
          }
        }
      }
    }
  }
}

export const responseSchema = {
  "type": "object",
  "additionalProperties": false,
  "required": [
    "answers"
  ],
  "properties": {
    "radixAddress": {
      "type": ["string", "null"],
      "minLength": 51,
      "maxLength": 51
    },
    "answers": {
      "type": "object"
    }
  }
};

const r = {
  "type": "object",
  "additionalProperties": false,
  "required": [
      "id",
      "surveyId",
      "created",
      "answers"
  ],
  "properties": {
    "id": {
      "type": "string",
      "minLength": 21,
      "maxLength": 21
    },
    
    "surveyId": {
      "type": "string",
      "minLength": 21,
      "maxLength": 21
    },
    
    "created": {
      "type": "number"
    },
    
    "radixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51
    },
    
    "answers": {
      "type": "object"
    }
  }
}
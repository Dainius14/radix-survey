// Validate at https://www.jsonschemavalidator.net/
// More info about about schemas https://ajv.js.org/keywords.html
// and https://json-schema.org/understanding-json-schema/reference/index.html
// Scheme doesn't allow other properties for survey, question and answer than what is defined in
// "properties" property for each entity.
// Required properties are defined in "required" array for each entity.
// Property types and other attributes for it are defined in "properties" for each property

export const newSurveySchema = {
  // Survey info
  "type": "object",
  "additionalProperties": false,
  "required": [
    "radixAddress",
    "title",
    "shortDescription",
    "questions"
  ],
  "properties": {
    "radixAddress": {
      "type": "string",
      "minLength": 51,
      "maxLength": 51,

    },
    "title": {
      "type": "string",
      "minLength": 0,
      "maxLength": 50
    },
    "shortDescription": {
      "type": "string",
      "minLength": 0,
      "maxLength": 1000
    },

    // Questions
    "questions": {
      "type": "object",
      "required": [
        "items"
      ],
      "properties": {
        "items": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "integer"
          }
        }
      },

      // Question properties
      "additionalProperties": {
        "type": "object",
        "required": [
          "id",
          "questionText",
          "questionType",
          "required"
        ],
        "additionalProperties": false,
        
        // If questionType is radio or checkbox, answerChoices are required
        // with minimum item count of 2
        "anyOf": [
          {
          	"properties": {
              "questionType": { "enum": ["radio", "checkbox"] },
              "answerChoices": {
                "properties": {
                  "items": {
                  	"minItems": 2
                  }
                }
              }
          	},
            "required": ["answerChoices"]
          },
          {
          	"properties": {
              "questionType": { "enum": ["shortText", "longText"] },
              "answerChoices": { "not": {} }
          	}
          }
        ],
          
        "properties": {
          "id": {
            "type": "integer"
          },
          "questionText": {
            "type": "string",
            "minLength": 0,
            "maxLength": 100,
          },
          "questionType": {
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
            
          // Answer choices
          "answerChoices": {
          	"type": "object",
            "required": ["items"],
            "properties": {
              "items": {
              	"type": "array",
                "items": {
                  "type": "integer"
                }
              }
            },
            
            "additionalProperties": {
              "type": "object",
              "required": ["id", "answerText"],
              "additionalProperties": false,

              // Answer choice properties
              "properties": {
                "id": {
                  "type": "integer"
                },
                "answerText": {
                  "type": "string",
                  "minLength": 0,
                  "maxLength": 100
                }
              }
            }
          }
        }
      }
    }
  }
}

'use strict';


const lexResponse = require("../helper/responseBuilder");
const db = require('../config/db');
const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });
const docClient = new AWS.DynamoDB.DocumentClient();
// --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment for employee on boarding.
 *
 */

let onBoardPrompt = (data, message) => {
    let promptMessage = message + '\n';
    let a = 0;
    for (let i in data) {
        promptMessage += `${Object.keys(data)[a]} for ${data[i].sort_desc}.\n`;
        a++;
    }

    return promptMessage;
};

let onboardClientSession = (data, message, image) => {

    let result = {};
    let buttons = [];
    result.message = message;
    result.image = (typeof image !== 'undefined') ? image : null;
    let a = 0;
    for (let i in data) {
        buttons.push({
            text: data[i].sort_desc,
            value: Object.keys(data)[a]
        });
        a++;
    }
    result.buttons = buttons;

    return result;
};

exports.dialog = function (intentRequest, employee, callback) {

    const companyRules = intentRequest.currentIntent.slots.OnBoadoardInfo;
    const source = intentRequest.invocationSource;
    const userId = intentRequest.userId;
    const sessionAttributes = intentRequest.sessionAttributes || {};
    sessionAttributes.employee = JSON.stringify(employee);

    onboardingData(employee.company_id, (result) => {
        if (source === 'DialogCodeHook') {
            // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
            const slots = intentRequest.currentIntent.slots;
            let validationResult = validateOnBoarding(companyRules, result);

            if (!validationResult.isValid) {
                sessionAttributes.client = JSON.stringify(onboardClientSession(result, 'I did not recognize that, please type one of the following :'));
                slots[`${validationResult.violatedSlot}`] = null;
                callback(lexResponse.elicitSlot(
                    sessionAttributes,
                    intentRequest.currentIntent.name,
                    slots,
                    validationResult.violatedSlot,
                    validationResult.message
                ));
                return;
            }

            if (!companyRules) {
                sessionAttributes.client = JSON.stringify(onboardClientSession(result, 'Would you like to access? please type :'));
                callback(lexResponse.elicitSlot(
                    sessionAttributes,
                    intentRequest.currentIntent.name,
                    intentRequest.currentIntent.slots,
                    "OnBoadoardInfo",
                    { contentType: 'PlainText', content: onBoardPrompt(result, 'Would you like to access? please type :') }
                ));
                return;
            }
        }

        callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
            { contentType: 'PlainText', content: `${companyRules} : ${result[companyRules].value}` }));
    });
}

let getRuleValue = (rulesType, data) => {
    return data[rulesType.toLowerCase()];
}

let validateOnBoarding = (RulesType, data) => {
    if (RulesType && !getRuleValue(RulesType, data)) {
        return lexResponse.buildValidationResult(false, 'OnBoadoardInfo', onBoardPrompt(data, 'I did not recognize that, please type one of the following :'));
    }

    return lexResponse.buildValidationResult(true, null, null);
}

let onboardingData = (company_id, callback) => {
    let params = {
        TableName: 'orlito_onboarding',
        KeyConditionExpression: 'company_id = :company_id',
        ExpressionAttributeValues: {
            ':company_id': parseInt(company_id)
        }
    };

    docClient.query(params, (err, data) => {
        if (err) throw err;
        callback(data.Count > 0 ? data.Items[0].data : null);
    });
};
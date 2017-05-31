'use strict';


const lexResponse = require("../helper/responseBuilder");
const db = require('../config/db')

// --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment for employee on boarding.
 *
 */

let onBoardPrompt = (data, message) => {
    let promptMessage = message+ '\n';
    for(let i = 1; i <= data.length; i++)
    {
        promptMessage += `${data[i-1].key} for ${data[i-1].sort_desc}.\n`;
    }

    return promptMessage;
};

let onboardClientSession = (data, message, image) => {

    let result = {};
    let buttons = [];
    result.message = message;
    result.image = (typeof image !== 'undefined') ?  image : null;

    for(let i = 1; i <= data.length; i++)
    {
        buttons.push({
            text : data[i - 1].sort_desc,
            value : data[i - 1].key
        })
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

    if (source === 'DialogCodeHook') {
    // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        const slots = intentRequest.currentIntent.slots;
        
        if (companyRules) {
            let validationResult = lexResponse.buildValidationResult(true, null, null);
            getOnboardingValue({company_id:employee.company_id, key:companyRules}, (results) => {
                if(results===null){
                    getOnboardingList(employee.company_id, (results) => {
                        sessionAttributes.client = JSON.stringify(onboardClientSession(results, 'I did not recognize that, please type one of the following : '));
                        validationResult =  lexResponse.buildValidationResult(false, 'OnBoadoardInfo', onBoardPrompt(results, 'I did not recognize that, please type one of the following : '));
                        slots[`${validationResult.violatedSlot}`] = null;
                        callback(lexResponse.elicitSlot(
                            sessionAttributes, 
                            intentRequest.currentIntent.name,
                            slots, 
                            validationResult.violatedSlot, 
                            validationResult.message
                        ));
                    });
                }
                else
                {
                    callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
                    { contentType: 'PlainText', content: `${companyRules} : ${results}` }));
                }
            });
            return;
        }

        if (!companyRules) {
            getOnboardingList(employee.company_id, (results) => {
                // onBoardPrompt(results);
                sessionAttributes.client = JSON.stringify(onboardClientSession(results, 'Would you like to access? please type :'));
                callback(lexResponse.elicitSlot(
                    sessionAttributes,
                    intentRequest.currentIntent.name,
                    intentRequest.currentIntent.slots,
                    "OnBoadoardInfo",
                    { contentType: 'PlainText', content: onBoardPrompt(results, 'Would you like to access? please type :') }
                ));
            });
            return;
        }

        // callback(lexResponse.delegate(null, intentRequest.currentIntent.slots));
        // return;
    }

    callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: 'done' }));
}

let getOnboardingList = (data, callback) => {
    db.connection.getConnection( (err, connection) => {
        let statement = 'select `key`, `sort_desc` from onboarding where is_active = 1 and company_id = ?';
        connection.query(statement, [data], (error, results, fields) => {
            if (error) throw error;
            connection.release();
            callback(results);
        });
    });
}

let getOnboardingValue = (data, callback) => {
    db.connection.getConnection( (err, connection) => {
        let statement = 'select `value` from onboarding where is_active = 1 and company_id = ? and `key` = ? limit 1';
        connection.query(statement, [data.company_id, data.key], (error, results, fields) => {
            if (error) throw error;
            connection.release();
            callback(results.length > 0 ? results[0].value : null);
        });
    });
}
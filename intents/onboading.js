'use strict';


const lexResponse = require("../helper/responseBuilder");
const onboardDataInfo = require("../data/onboardInfo")

// --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment for employee on boarding.
 *
 */

let onBoardPrompt = 
`Would you like to access?
please type :
1. policies for Company policies
2. info for Company information
3. contract for Employee contract details
4. operation for Operations checklist
5. guide for New employee best practice guide
6. introduction for Enter new employee induction & orientation
`;


exports.dialog = function (intentRequest, employee, callback) {
    
    const companyRules = intentRequest.currentIntent.slots.OnBoadoardInfo;
    const source = intentRequest.invocationSource;
    const userId = intentRequest.userId;

    if (source === 'DialogCodeHook') {
    // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        const slots = intentRequest.currentIntent.slots;
        const validationResult = validateOnBoarding(companyRules);
        if (!validationResult.isValid) {
            slots[`${validationResult.violatedSlot}`] = null;
            callback(lexResponse.elicitSlot(
                intentRequest.sessionAttributes, 
                intentRequest.currentIntent.name,
                slots, 
                validationResult.violatedSlot, 
                validationResult.message
            ));
            return;
        }

        if (!companyRules) {
            callback(lexResponse.elicitSlot(
                intentRequest.sessionAttributes, 
                intentRequest.currentIntent.name,
                intentRequest.currentIntent.slots,
                 "OnBoadoardInfo",
                { contentType: 'PlainText', content: onBoardPrompt }
            ));
            return;
        }

        // callback(lexResponse.delegate(null, intentRequest.currentIntent.slots));
        // return;
    }

    // Order the flowers, and rely on the goodbye message of the bot to define the message to the end user.  In a real bot, this would likely involve a call to a backend service.
    callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: `${companyRules} : ` + getRuleValue(companyRules) }));
}

function getRuleValue(rulesType) {
    const companyRuleMap = onboardDataInfo;
    return companyRuleMap[rulesType.toLowerCase().replace(/[ ]/g,'_')];
}

function validateOnBoarding(RulesType) {
    if (RulesType && !getRuleValue(RulesType)) {
        return lexResponse.buildValidationResult(false, 'OnBoadoardInfo', 'I did not recognize that,please type one of the following :' + `
1. policies for Company policies
2. info for Company information
3. contract for Employee contract details
4. operation for Operations checklist
5. guide for New employee best practice guide
6. introduction for Enter new employee induction & orientation`);
    }
    
    return lexResponse.buildValidationResult(true, null, null);
}
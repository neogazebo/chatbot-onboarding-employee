'use strict';


const lexResponse = require("../helper/responseBuilder");

// --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment for employee on boarding.
 *
 */

let onBoardPrompt = 
`Would you like to access?\\n
please type :\\n
\\n1. policies for Company policies
\\n2. info Company information
\\n3. contract Employee contract details
\\n4. operation Operations checklist
\\n5. guide New employee best practice guide
\\n6. introduction Enter new employee induction & orientation
`;

exports.dialog = function (intentRequest, callback) {
    
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

        callback(lexResponse.delegate(null, intentRequest.currentIntent.slots));
        return;
    }

    // Order the flowers, and rely on the goodbye message of the bot to define the message to the end user.  In a real bot, this would likely involve a call to a backend service.
    callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: `${companyRules} : ` + getRuleValue(companyRules) }));
}

function getRuleValue(rulesType) {
    const companyRuleMap = gCdata;
    return companyRuleMap[rulesType.toLowerCase().replace(/[ ]/g,'_')];
}

function validateOnBoarding(RulesType) {
    if (RulesType && !getRuleValue(RulesType)) {
        return lexResponse.buildValidationResult(false, 'GQ', 'I did not recognize that, we have rules about Benefits, Dress code, Company Policy or Holiday');
    }
    
    return lexResponse.buildValidationResult(true, null, null);
}
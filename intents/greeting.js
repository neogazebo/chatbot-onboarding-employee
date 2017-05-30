'use strict';

const lexResponse = require("../helper/responseBuilder");

exports.dialog = function(intentRequest, employee, callback) {

    const source = intentRequest.invocationSource;
    const sessionAttributes = intentRequest.sessionAttributes || {};
    
    sessionAttributes.employee = JSON.stringify(employee);
    // if (source === 'DialogCodeHook') {
        callback(lexResponse.close(sessionAttributes, 'Fulfilled',
        { contentType: 'PlainText', content: `Hi ${employee.name}, What are you here to do? Onboard / Train / Engage Survey / Ask a question`}));
}
'use strict';

const lexResponse = require("../helper/responseBuilder");

exports.dialog = function(intentRequest,callback) {

    const source = intentRequest.invocationSource;

    // if (source === 'DialogCodeHook') {
        callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',
        { contentType: 'PlainText', content: "What are you here to do? Onboard / Train / Engage Survey / Ask a question"}));
    // }
}
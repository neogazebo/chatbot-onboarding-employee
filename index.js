'use strict';

// const AWS = require("aws-sdk");

// AWS.config.update({
//   region: "us-east-1"
// });

// const docClient = new AWS.DynamoDB.DocumentClient();


//------------------- intents module  --------------

const guestMode = require("./intents/guestMode");
const greeting = require("./intents/greeting");
const onboard = require("./intents/onboading");
const lexResponse = require("./helper/responseBuilder");

const intentsAvailableMap = {
    Greetings : {
        handler : greeting,
        login : true
    }, 
    OnBoarding: {
        handler : onboard,
        login : true
    }
};

// --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    const sessionAttributes = intentRequest.sessionAttributes || {};

    /** testing purpose, dont forget to remove */

    let exmp_employee = {
        name : 'febri pratama',
        id: 1,
        company_id: 1
    };

    let employee = sessionAttributes.employee ? JSON.parse(sessionAttributes.employee) : exmp_employee;

    /**  testing purpose end */
     
    // uncomment this after testing
    // let employee = sessionAttributes.employee ? JSON.parse(sessionAttributes.employee) : null;
    

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    let intenstsAvailable = intentsAvailableMap[intentName];

    if(intenstsAvailable.login === true)
    {
        if(employee !== false)
        {
            if (intenstsAvailable.handler) {
                return intenstsAvailable.handler.dialog(intentRequest, employee, callback);
            }
        }
        else
        {
            callback(lexResponse.close(intentRequest.sessionAttributes, 'Fulfilled',{ contentType: 'PlainText', content: 'please login first' }));
        }
    }
    else
    {
        if (intenstsAvailable.handler) {
                return intenstsAvailable.handler.dialog(intentRequest, callback);
        }
    }

    throw new Error(`Intent with name ${intentName} not supported`);
}



// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        /*
        if (event.bot.name !== 'OrderFlowers') {
             callback('Invalid Bot Name');
        }
        */
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
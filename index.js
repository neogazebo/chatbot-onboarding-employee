'use strict';

// const AWS = require("aws-sdk");

// AWS.config.update({
//   region: "us-east-1"
// });

// const docClient = new AWS.DynamoDB.DocumentClient();

const guestMode = require("./intents/guestMode");

// --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'GuestMode') {
        return guestMode.dialog(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// function getRulesByCompanyId(userId, callback) {
//     var employeeStatement = {
//             TableName: 'Employee',
//             KeyConditionExpression: 'EmployeeId = :empID',
//             ExpressionAttributeValues: {
//                 ':empID': userId
//         }
//     };

//     docClient.query(employeeStatement, (err, data) => {
//         if (err) throw err;

//         var companyName = data.Count > 0 ? data.Items[0].CompanyName: "A";

//         var companyStatement = {
//             TableName: 'CompanyRules',
//             KeyConditionExpression: 'CompanyName = :compName',
//             ExpressionAttributeValues: {
//                 ':compName': companyName
//             }
//         };

//         docClient.query(companyStatement, (err, data) => {
//             if (err) throw err;
//             if(data.Count > 0)
//             {
//                 callback(null, data.Items[0]);
//             }
//         });
//     });    
// };



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
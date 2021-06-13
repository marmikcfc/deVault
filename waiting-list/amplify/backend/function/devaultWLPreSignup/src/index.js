/*
  this file will loop through all js modules which are uploaded to the lambda resource,
  provided that the file names (without extension) are included in the "MODULES" env variable.
  "MODULES" is a comma-delimmited string.
*/
const moduleNames = process.env.MODULES.split(',');
const modules = moduleNames.map(name => require(`./${name}`));

exports.handler = (event, context, callback) => {
  // Confirm the user
  event.response.autoConfirmUser = true;
  // Set the email as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty('email')) {
    event.response.autoVerifyEmail = true;
  }
  // Set the phone number as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty('phone_number')) {
    event.response.autoVerifyPhone = true;
  }
  // Return to Amazon Cognito
  callback(null, event);
};
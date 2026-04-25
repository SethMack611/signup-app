const AWS = require("aws-sdk");

// When running locally via Docker, point to the local DynamoDB container.
// In a real AWS deployment, remove the endpoint override and set your region.
const config = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.DYNAMO_ENDPOINT) {
  config.endpoint = process.env.DYNAMO_ENDPOINT;
  config.accessKeyId = "local"; // DynamoDB Local accepts any non-empty string
  config.secretAccessKey = "local";
}

const client = new AWS.DynamoDB(config);
const dynamo = new AWS.DynamoDB.DocumentClient({ service: client });

const TABLE_NAME = process.env.TABLE_NAME || "Signups";

module.exports = { dynamo, client, TABLE_NAME };

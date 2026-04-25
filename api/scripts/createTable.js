const { client, TABLE_NAME } = require("../dynamo");

const params = {
  TableName: TABLE_NAME,
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "id",       AttributeType: "S" },
    { AttributeName: "category", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "category-index",
      KeySchema: [{ AttributeName: "category", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

async function createTable() {
  try {
    await client.createTable(params).promise();
    console.log(`✅  Table "${TABLE_NAME}" created with category-index GSI`);
  } catch (err) {
    if (err.code === "ResourceInUseException") {
      console.log(`ℹ️   Table "${TABLE_NAME}" already exists — skipping creation`);
    } else {
      throw err;
    }
  }
}

module.exports = { createTable };

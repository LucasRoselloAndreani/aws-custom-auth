const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const createGroupSchema = require('./validations/create-group');

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

  
exports.create = async function(event) {
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const body = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

  const { error } = createGroupSchema.validate(body);

  if(error) {
    return {
      statusCode: 422,
      body: JSON.stringify(error)
    }
  }

  body[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: body
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: 'Group has been created successfully' };
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
    DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse };
  }
};

exports.getAll = async function(event) {
 const params = {
    TableName: TABLE_NAME
  };

  try {
    const response = await db.scan(params).promise();
    return { statusCode: 200, body: JSON.stringify(response.Items) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError)};
  }
};

exports.getOne = async function(event) {
  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId
    }
  };

  try {
    const response = await db.get(params).promise();
    return { statusCode: 200, body: JSON.stringify(response.Item) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

exports.update = async function(event) {
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }

  const editedItemId = event.pathParameters.id;
  if (!editedItemId) {
    return { statusCode: 400, body: 'invalid request, you are missing the path parameter id' };
  }

  const editedItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  const editedItemProperties = Object.keys(editedItem);
  if (!editedItem || editedItemProperties.length < 1) {
      return { statusCode: 400, body: 'invalid request, no arguments provided' };
  }

  const firstProperty = editedItemProperties.splice(0,1);
  const params = {
      TableName: TABLE_NAME,
      Key: {
        [PRIMARY_KEY]: editedItemId
      },
      UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW'
  };

  params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];

  editedItemProperties.forEach(property => {
      params.UpdateExpression += `, ${property} = :${property}`;
      params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
  });

  try {
    await db.update(params).promise();
    return { statusCode: 204, body: '' };
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
    DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse };
  }
};
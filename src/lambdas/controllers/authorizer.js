const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const authService = require('./auth-services');

const SECRET = process.env.SECRET || "ZB_[}&2wERPy7|J"
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || "";
const GROUPS_TABLE_NAME = process.env.GROUPS_TABLE_NAME || "";


exports.handler =  async function(event, context, callback) {
    const { authorizationToken, methodArn } = event;
    
    const tmp = methodArn.split(':');
    const apiGatewayArnTmp = tmp[5];

    const urlPath = apiGatewayArnTmp.split('/')[3];

    try {
        const decoded = authService.decodeToken(authorizationToken, SECRET);
        
        const { userId, groupId } = decoded;
        

        const userParams = {
            TableName: USERS_TABLE_NAME,
            Key: {
                userId: userId
            }
        };

        const userResponse = await db.get(userParams).promise();

        const user = userResponse.Item;

        if(!user.isActive) {
            throw new Error('User is inactive');
        }
        
        const groupParams = {
            TableName: GROUPS_TABLE_NAME,
            Key: {
                groupId: groupId
            }
        };

        const groupResponse = await db.get(groupParams).promise();
        const group = groupResponse.Item;
        
        if(!group) {
            throw new Error('Group does not exist');
        }

        const hasAccess = group.permissions.filter(item => item.resource === urlPath);


        if(hasAccess.length) {
            callback(null, authService.generatePolicy(user.userId, 'Allow', event.methodArn));
        } else {
            callback(null, authService.generatePolicy(user.userId, 'Deny', event.methodArn));
        }
    } catch(err) {
        callback("Unauthorized");   // Return a 401 Unauthorized response
    }
};


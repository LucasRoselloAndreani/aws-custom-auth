const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcrypt');
const authService = require('./auth-services');
const loginUserSchema = require('./validations/login-user');

const SECRET = process.env.SECRET || "ZB_[}&2wERPy7|J"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ZB_[}&2wERPy7|J.."
const JWT_EXPIRES_IN = 900
const REFRESH_JWT_EXPIRES_IN = '720h'
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || "";

exports.handler = async function(event) {
    const { body } = event;
        
    if (!body) {
      return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    
    const item = typeof body == 'object' ? body : JSON.parse(body);
    
    const { error } = loginUserSchema.validate(item);

    if(error) {
      return {
        statusCode: 422,
        body: JSON.stringify(error)
      }
    }

    const { userName,
        password
    } = item;

    const params = {
      TableName: USERS_TABLE_NAME,
      FilterExpression: 'userName = :userNameValue',
      ExpressionAttributeValues: {
        ':userNameValue': userName
      }
    };
    
    try {
        const response = await db.scan(params).promise();
        const user = response.Items[0];

        if(!user) {
                return { 
                    statusCode: 401,
                    body: JSON.stringify({
                        message: 'Incorrect user or password'
                    }
                )
            };
        }

        if(!user.isActive) {
            return { 
                statusCode: 403, 
                body: JSON.stringify({
                    message: 'User INACTIVE'
                })
            };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return { 
                statusCode: 401 , 
                body: JSON.stringify({
                    message: 'Incorrect user or password'
                })
            };
        }

        const userData = {
            userId: user.userId,
            groupId: user.groupId
        };

        const { token, refreshToken } = authService.generateTokens({
            userData,
            SECRET,
            REFRESH_SECRET,
            JWT_EXPIRES_IN,
            REFRESH_JWT_EXPIRES_IN
        });

        const headers = authService.setHeaders(token, refreshToken);

        return { 
            statusCode: 200,
            headers,
            body: JSON.stringify({
                token,
                refreshToken
            }) 
        };

    } catch (dbError) {
        return { 
            statusCode: 500, 
            body: JSON.stringify(dbError)
        };
    }
};

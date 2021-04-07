const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const jwt = require('jsonwebtoken');
const authService = require('./auth-services');
const refreshTokenSchema = require('./validations/refresh-token');

const SECRET = process.env.SECRET || "ZB_[}&2wERPy7|J"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ZB_[}&2wERPy7|J.."
const JWT_EXPIRES_IN = 900
const REFRESH_JWT_EXPIRES_IN = '720h'
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || "";

exports.handler = async function(event) {    
    try {

      const { body } = event;

      if (!body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
      }
    
      const item = typeof body == 'object' ? body : JSON.parse(body);
      
      const { error } = refreshTokenSchema.validate(item);

      if(error) {
        return {
          statusCode: 422,
          body: JSON.stringify(error)
        }
      }

        const decoded = jwt.verify(item.refreshToken, REFRESH_SECRET);
        
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                userId: decoded.userId
            }
        };

        
        const response = await db.get(params).promise();
        
        const { userId } = response.Item;

        const userData = {
            userId
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
                token: token, 
                refreshToken: refreshToken
            })
        };

    } catch(err) {
        return { 
            statusCode: 401, 
            body: JSON.stringify({
                message: 'Invalid credentials'
            })
        };
    }
};

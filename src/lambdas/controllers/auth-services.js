const jwt = require('jsonwebtoken');

module.exports = {
    generateTokens: (data) => {
        const {
            userData,
            SECRET,
            REFRESH_SECRET,
            JWT_EXPIRES_IN,
            REFRESH_JWT_EXPIRES_IN
        } = data;

        const token = jwt.sign(userData, SECRET, { expiresIn: JWT_EXPIRES_IN });
        const refreshToken = jwt.sign(userData, REFRESH_SECRET, { expiresIn: REFRESH_JWT_EXPIRES_IN });
        return { token, refreshToken };
    },
    decodeToken: (token, SECRET) => {
        return jwt.verify(token, SECRET);
    },
    setHeaders: (token, refreshToken) => {
        return {
            'X-Authorization-token': token,
            'X-Authorization-refresh-token': refreshToken
        };
    },
    generatePolicy: (principalId, effect, resource) => {
        const authResponse = {};
        
        authResponse.principalId = principalId;
        if (effect && resource) {
            const policyDocument = {};
            policyDocument.Version = '2012-10-17'; 
            policyDocument.Statement = [];
            const statementOne = {};
            statementOne.Action = 'execute-api:Invoke'; 
            statementOne.Effect = effect;
            statementOne.Resource = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }
        
        // Optional output with custom properties of the String, Number or Boolean type.
        authResponse.context = {
            "stringKey": "stringval",
            "numberKey": 123,
            "booleanKey": true
        };
        return authResponse;
    }    
}
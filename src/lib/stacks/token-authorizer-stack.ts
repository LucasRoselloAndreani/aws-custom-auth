import * as cdk from '@aws-cdk/core';

import { TokenAuthorizerLambda } from './../../lambdas/handlers/token-authorizer';

import { Table } from '@aws-cdk/aws-dynamodb';
import { TokenAuthorizer } from '@aws-cdk/aws-apigateway';

interface ServerlessProps extends cdk.StackProps {
    userTable: Table;
    groupTable: Table;
}

export class TokenAuthorizerStack extends cdk.Stack {
    
    private tokenAuthorizerLambda: TokenAuthorizerLambda;   
    private lambdasPath: string = 'src/lambdas/controllers';
    public readonly customAuthorizer: TokenAuthorizer;

    constructor(scope: cdk.Construct, id: string, props?: ServerlessProps) {
        super(scope, id, props);

        this.tokenAuthorizerLambda = new TokenAuthorizerLambda(this, {
            LAMBDAS_PATH: this.lambdasPath,
            GROUPS_TABLE_NAME: props?.groupTable.tableName || '',
            USERS_TABLE_NAME: props?.userTable.tableName || ''
        });

        props?.userTable.grantReadData(this.tokenAuthorizerLambda.authorizer);
        props?.groupTable.grantReadData(this.tokenAuthorizerLambda.authorizer);

        /* this.customAuthorizer = new apigateway.TokenAuthorizer(this, `CustomTokenAuthorizer`, {
            handler: this.tokenAuthorizerLambda.authorizer
        }); */
    }
}
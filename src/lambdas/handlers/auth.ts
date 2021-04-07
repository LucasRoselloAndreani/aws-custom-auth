import * as lambda from '@aws-cdk/aws-lambda';
import { Code } from '@aws-cdk/aws-lambda';
import * as cdk from "@aws-cdk/core";

export interface LambdasProps extends cdk.StackProps {
    USERS_TABLE_NAME: string;
    GROUPS_TABLE_NAME: string;
    LAMBDAS_PATH: string
}

export class AuthLambdas {
    private runtime = lambda.Runtime.NODEJS_14_X;
    private code: Code;
    
    public readonly login: lambda.Function;
    public readonly token: lambda.Function;

    constructor(scope: cdk.Construct, props?: LambdasProps) {

        this.code = lambda.Code.fromAsset(props?.LAMBDAS_PATH || '');

        this.login = new lambda.Function(scope, 'Login', {
            runtime: this.runtime,
            code: this.code,
            handler: 'auth-login.handler',
            environment: {
                USERS_TABLE_NAME: props?.USERS_TABLE_NAME || '',
                GROUPS_TABLE_NAME: props?.GROUPS_TABLE_NAME || ''
            }
        });

        this.token = new lambda.Function(scope, 'Token', {
            runtime: this.runtime,
            code: this.code,
            handler: 'auth-token.handler',
            environment: {
                USERS_TABLE_NAME: props?.USERS_TABLE_NAME || '',
                GROUPS_TABLE_NAME: props?.GROUPS_TABLE_NAME || ''
            }
        });
    }
}

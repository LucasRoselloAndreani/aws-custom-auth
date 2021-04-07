import * as lambda from '@aws-cdk/aws-lambda';
import { Code } from '@aws-cdk/aws-lambda';
import * as cdk from "@aws-cdk/core";

export interface LambdasProps extends cdk.StackProps {
    TABLE_NAME: string;
    PRIMARY_KEY: string;
    LAMBDAS_PATH: string
}

export class UserLambdas {

    private runtime = lambda.Runtime.NODEJS_14_X;
    private code: Code;
    
    public readonly createUser: lambda.Function;
    public readonly getAllUser: lambda.Function;
    public readonly getOneUser: lambda.Function;
    public readonly updateUser: lambda.Function;

    constructor(scope: cdk.Construct, props?: LambdasProps) {

        this.code = lambda.Code.fromAsset(props?.LAMBDAS_PATH || '');
        
        this.createUser = new lambda.Function(scope, 'CreateUser', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.create',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.getAllUser = new lambda.Function(scope, 'GetAllUser', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.getAll',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.getOneUser = new lambda.Function(scope, 'GetOneUser', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.getOne',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.updateUser = new lambda.Function(scope, 'UpdateUser', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.update',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });
    }
}

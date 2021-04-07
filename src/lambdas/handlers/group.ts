import * as lambda from '@aws-cdk/aws-lambda';
import { Code } from '@aws-cdk/aws-lambda';
import * as cdk from "@aws-cdk/core";

export interface LambdasProps extends cdk.StackProps {
    TABLE_NAME: string;
    PRIMARY_KEY: string;
    LAMBDAS_PATH: string
}

export class GroupLambdas {
    private runtime = lambda.Runtime.NODEJS_14_X;
    private code: Code;

    public readonly createGroup: lambda.Function;
    public readonly getAllGroup: lambda.Function;
    public readonly getOneGroup: lambda.Function;
    public readonly updateGroup: lambda.Function;

    constructor(scope: cdk.Construct, props?: LambdasProps) {

        this.code = lambda.Code.fromAsset(props?.LAMBDAS_PATH || '');

        this.createGroup = new lambda.Function(scope, 'CreateGroup', {
            runtime: this.runtime,
            code: this.code,
            handler: 'group.create',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.getAllGroup = new lambda.Function(scope, 'GetAllGroup', {
            runtime: this.runtime,
            code: lambda.Code.fromAsset(`${ props?.LAMBDAS_PATH }`),
            handler: 'group.getAll',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.getOneGroup = new lambda.Function(scope, 'GetOneGroup', {
            runtime: this.runtime,
            code: this.code,
            handler: 'group.getOne',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });

        this.updateGroup = new lambda.Function(scope, 'UpdateGroup', {
            runtime: this.runtime,
            code: this.code,
            handler: 'group.update',
            environment: {
                TABLE_NAME: props?.TABLE_NAME || '',
                PRIMARY_KEY: props?.PRIMARY_KEY || ''
            }
        });
    }
}

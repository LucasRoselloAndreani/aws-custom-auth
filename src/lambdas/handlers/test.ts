import * as lambda from '@aws-cdk/aws-lambda';
import { Code } from '@aws-cdk/aws-lambda';
import * as cdk from "@aws-cdk/core";

export interface LambdasProps extends cdk.StackProps {
    LAMBDAS_PATH: string
}

export class TestLambdas {
    private runtime = lambda.Runtime.NODEJS_14_X;
    private code: Code;

    public readonly getTest: lambda.Function;

    constructor(scope: cdk.Construct, props?: LambdasProps) {

        this.code = lambda.Code.fromAsset(props?.LAMBDAS_PATH || '');

        this.getTest = new lambda.Function(scope, 'GetTest', {
            runtime: this.runtime,
            code: this.code,
            handler: 'test.handler'
        });
    }
}

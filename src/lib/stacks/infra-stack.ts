import * as cdk from '@aws-cdk/core';
import { DataStack } from './data-stack';
import { ApiGatewayStack } from './api-gateway-stack';
import { ServerlessStack } from './serverless-stack';
import { TokenAuthorizerStack } from './token-authorizer-stack';

export interface InfraProps extends cdk.StackProps {
  environment: string;
  prefix: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: InfraProps) {
    super(scope, id, props);

    const prefix = props?.prefix || '';

    const dataStack = new DataStack(this, `${prefix}-data`, {
      prefix
    });
    
    const serverLessStack = new ServerlessStack(this, `${prefix}-serverless`, {
      userTable: dataStack.userTable,
      groupTable: dataStack.groupTable
    });

    /*const tokenAhtorizerStack = new TokenAuthorizerStack(this, `${prefix}-token-authorizer`, {
      userTable: dataStack.userTable,
      groupTable: dataStack.groupTable
    });*/

    new ApiGatewayStack(this, `${prefix}-apigateway`, {
      authLambdas: serverLessStack.authLambdas,
      groupLambdas: serverLessStack.groupLambdas,
      userLambas: serverLessStack.userLambdas,
      testLambdas: serverLessStack.testLambdas,
      userTable: dataStack.userTable,
      groupTable: dataStack.groupTable
    });
  }
}

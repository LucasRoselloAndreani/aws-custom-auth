import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";

import { Table } from '@aws-cdk/aws-dynamodb';
import { addCorsOptions } from "../../lambdas/services/cors";
import { UserLambdas } from "../../lambdas/handlers/user";
import { GroupLambdas } from "../../lambdas/handlers/group";
import { AuthLambdas } from "../../lambdas/handlers/auth";
import { TestLambdas } from "../../lambdas/handlers/test";

import { TokenAuthorizer } from "@aws-cdk/aws-apigateway";
import { TokenAuthorizerLambda } from './../../lambdas/handlers/token-authorizer';

interface ApiGatewayProps extends cdk.StackProps {
    groupLambdas: GroupLambdas;
    userLambas: UserLambdas;
    authLambdas: AuthLambdas;
    testLambdas: TestLambdas;
    userTable: Table;
    groupTable: Table;
}

export class ApiGatewayStack extends cdk.Stack {

    private userLambdas: UserLambdas;
    private groupLambdas: GroupLambdas;
    private authLambdas: AuthLambdas;
    private testLambdas: TestLambdas;
    private customAuthorizer: TokenAuthorizer;
    
    constructor(scope: cdk.Construct, id: string, props: ApiGatewayProps) {
        super(scope, id, props);
                
        this.userLambdas = props.userLambas;
        this.groupLambdas = props.groupLambdas;
        this.authLambdas = props.authLambdas;
        this.testLambdas = props.testLambdas;
        
        const createGroupIntegration = new apigateway.LambdaIntegration(this.groupLambdas.createGroup);
        const getAllGroupIntegration = new apigateway.LambdaIntegration(this.groupLambdas.getAllGroup);
        const getOneGroupIntegration = new apigateway.LambdaIntegration(this.groupLambdas.getOneGroup);
        const updateGroupIntegration = new apigateway.LambdaIntegration(this.groupLambdas.updateGroup);
        const getTestIntegration = new apigateway.LambdaIntegration(this.testLambdas.getTest);
        
        const tokenAuthorizerLambda = new TokenAuthorizerLambda(this, {
            LAMBDAS_PATH: 'src/lambdas/controllers',
            GROUPS_TABLE_NAME: props?.groupTable.tableName || '',
            USERS_TABLE_NAME: props?.userTable.tableName || ''
        });
        
        props?.userTable.grantReadData(tokenAuthorizerLambda.authorizer);
        props?.groupTable.grantReadData(tokenAuthorizerLambda.authorizer);

        const customAuthorizer = new apigateway.TokenAuthorizer(this, `CustomTokenAuthorizer`, {
            handler: tokenAuthorizerLambda.authorizer
        });

        const authApi = new apigateway.RestApi(this, 'AuthApi');

        const groupsRoot = authApi.root.addResource('groups');
        groupsRoot.addMethod('GET', getAllGroupIntegration);
        groupsRoot.addMethod('POST', createGroupIntegration);
        addCorsOptions(groupsRoot);

        const groupId = groupsRoot.addResource('{group_id}');
        groupId.addMethod('GET', getOneGroupIntegration);
        groupId.addMethod('PUT', updateGroupIntegration)
        addCorsOptions(groupId);

        const testRoot = authApi.root.addResource('test');

        testRoot.addMethod('GET', getTestIntegration, {
            authorizer: customAuthorizer
        });
        
        addCorsOptions(testRoot);

        const createUserIntegration = new apigateway.LambdaIntegration(this.userLambdas.createUser);
        const getAllUserIntegration = new apigateway.LambdaIntegration(this.userLambdas.getAllUser);
        const getOneUserIntegration = new apigateway.LambdaIntegration(this.userLambdas.getOneUser);
        const updateUserIntegration = new apigateway.LambdaIntegration(this.userLambdas.updateUser);


        const usersRoot = authApi.root.addResource('users');
        usersRoot.addMethod('GET', getAllUserIntegration);
        usersRoot.addMethod('POST', createUserIntegration);
        addCorsOptions(usersRoot);

        const userId = usersRoot.addResource('{user_id}');
        userId.addMethod('GET', getOneUserIntegration);
        userId.addMethod('DELETE', updateUserIntegration);
        addCorsOptions(userId);

        const loginIntegration = new apigateway.LambdaIntegration(this.authLambdas.login);
        const tokenIntegration = new apigateway.LambdaIntegration(this.authLambdas.token);

        const loginRoot = authApi.root.addResource('login');
        loginRoot.addMethod('POST', loginIntegration);
        addCorsOptions(loginRoot);

        const tokenRoot = authApi.root.addResource('token');
        tokenRoot.addMethod('POST', tokenIntegration);
        addCorsOptions(tokenRoot);
    }
}
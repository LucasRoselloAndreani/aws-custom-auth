import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";

import { UserLambdas } from "../../lambdas/handlers/user";
import { GroupLambdas } from "../../lambdas/handlers/group";
import { AuthLambdas } from "../../lambdas/handlers/auth";
import { TestLambdas } from '../../lambdas/handlers/test';

import { Table } from '@aws-cdk/aws-dynamodb';
import { TokenAuthorizer } from '@aws-cdk/aws-apigateway';

interface ServerlessProps extends cdk.StackProps {
    userTable: Table;
    groupTable: Table;
}

export class ServerlessStack extends cdk.Stack {
    
    public readonly userLambdas: UserLambdas;
    public readonly groupLambdas: GroupLambdas;
    public readonly authLambdas: AuthLambdas;
    public readonly testLambdas: TestLambdas;
    
    private readonly lambdasPath: string = 'src/lambdas/controllers';

    constructor(scope: cdk.Construct, id: string, props?: ServerlessProps) {
        super(scope, id, props);

        this.userLambdas = new UserLambdas(this, {
            TABLE_NAME: props?.userTable.tableName || '',
            PRIMARY_KEY: 'userId',
            LAMBDAS_PATH: this.lambdasPath
        });

        this.groupLambdas = new GroupLambdas(this, {
            TABLE_NAME: props?.groupTable.tableName || '',
            PRIMARY_KEY: 'groupId',
            LAMBDAS_PATH: this.lambdasPath
        });

        this.authLambdas = new AuthLambdas(this, {
            USERS_TABLE_NAME: props?.userTable.tableName || '',
            GROUPS_TABLE_NAME: props?.groupTable.tableName || '',
            LAMBDAS_PATH: this.lambdasPath
        });

        this.testLambdas = new TestLambdas(this, {
            LAMBDAS_PATH: this.lambdasPath
        });

        props?.userTable.grantReadWriteData(this.userLambdas.createUser);
        props?.userTable.grantReadData(this.userLambdas.getAllUser);
        props?.userTable.grantReadData(this.userLambdas.getOneUser);
        props?.userTable.grantWriteData(this.userLambdas.updateUser);

        props?.groupTable.grantWriteData(this.groupLambdas.createGroup);
        props?.groupTable.grantReadData(this.groupLambdas.getAllGroup);
        props?.groupTable.grantReadData(this.groupLambdas.getOneGroup);
        props?.groupTable.grantWriteData(this.groupLambdas.updateGroup);

        props?.userTable.grantReadData(this.authLambdas.login);
        props?.userTable.grantReadData(this.authLambdas.token);

        props?.groupTable.grantReadData(this.authLambdas.login);
        props?.groupTable.grantReadData(this.authLambdas.token);        

    }
}
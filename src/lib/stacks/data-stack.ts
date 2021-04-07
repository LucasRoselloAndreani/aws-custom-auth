import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export interface DataProps extends cdk.StackProps {
    prefix: string;
}

export class DataStack extends cdk.Stack {

    public readonly groupTable: Table;
    public readonly userTable: Table;

    constructor(
        scope: cdk.Construct,
        id: string,
        props: DataProps
    ) {
        super(scope, id, props);
                
        const groupTableName = `${ props.prefix }-groups`;

        this.groupTable = new Table(this, groupTableName, {
            partitionKey: {
                name: "groupId",
                type: AttributeType.STRING
            },
            tableName: groupTableName,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        
        const userTableName = `${ props.prefix }-users`;
        
        this.userTable = new Table(this, userTableName, {
            partitionKey: {
                name: "userId",
                type: AttributeType.STRING,
            },
            tableName: userTableName,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        
        this.userTable.addGlobalSecondaryIndex({
            indexName: 'userNameIndex',
            partitionKey: {
                name: 'userName',
                type: AttributeType.STRING
            }
        });

        const dynamodbRole = new iam.Role(this, 'DynamoDbRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
        });
       
        dynamodbRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:*'],
            resources: [this.groupTable.tableArn, this.userTable.tableArn]
        }));
    }


}
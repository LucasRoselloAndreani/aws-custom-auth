#!/usr/bin/env node
require("dotenv").config();
import * as cdk from '@aws-cdk/core';
import { InfraStack } from '../lib/stacks/infra-stack';

process.env.STACK_ENV = process.env.STACK_ENV || "prod";
const app = new cdk.App();
const prefix = `${process.env.STACK_ENV}-customauth`;

new InfraStack(app, `${prefix}-infra`, {
    prefix,
    environment: process.env.STACK_ENV
});

import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Customauth from '../src/lib/base-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Customauth.InfraStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

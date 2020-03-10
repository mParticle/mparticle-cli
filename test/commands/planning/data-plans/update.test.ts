import { expect, test } from '@oclif/test';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:update', () => {
  const updatedDataPlan = {
    data_plan_id: 'test',
    data_plan_name: 'Test',
    data_plan_description: 'This is my test'
  };

  test
    .nock('https://sso.auth.mparticle.com', api => {
      api
        .post('/oauth/token', {
          client_id: 'client',
          client_secret: 'secret',
          audience: 'https://api.mparticle.com',
          grant_type: 'client_credentials'
        })
        .reply(200, {
          access_token: 'DAS token',
          expires_in: 5,
          token_type: 'Bearer'
        });
    })
    .nock('https://api.mparticle.com', api => {
      api
        .patch('/planning/v1/1234/4567/8900/plans/test')
        .reply(200, updatedDataPlan);
    })
    .stdout()
    .command([
      'planning:data-plans:update',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlan=' + JSON.stringify(updatedDataPlan),
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a success message', ctx => {
      expect(ctx.stdout.trim()).to.equals("Updated Data Plan with ID 'test'");
    });
});

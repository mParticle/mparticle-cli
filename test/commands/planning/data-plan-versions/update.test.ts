import { expect, test } from '@oclif/test';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:update', () => {
  const updatedDataPlanVersion = {
    version: 4,
    version_description: 'Test Version',
    version_document: []
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
        .patch('/planning/v1/1234/4567/8900/plans/test/versions/4')
        .reply(200, updatedDataPlanVersion);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:update',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(updatedDataPlanVersion),
      '--versionNumber=4',
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a success message', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        "Updated Data Plan Version: 'test:v4'"
      );
    });
});

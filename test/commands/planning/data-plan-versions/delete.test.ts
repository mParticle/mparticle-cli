import { expect, test } from '@oclif/test';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:delete', () => {
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
        .delete('/planning/v1/1234/4567/8900/plans/test/versions/5')
        .reply(200);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--orgId=1234',
      '--accountId=4567',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--versionNumber=5',
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a success message', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        "Deleted Data Plan Version: 'test:v5'"
      );
    });
});
import { expect, test } from '@oclif/test';
import nock from 'nock';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:create', () => {
  const sampleDataPlanVersion = {
    version: 1,
    version_description: 'Test Version'
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
        .post('/planning/v1/1234/4567/8900/plans/test/versions')
        .reply(200, sampleDataPlanVersion);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:create',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a success message', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        "Created Data Plan Version: 'test:v1'"
      );
    });

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
      api.post('/planning/v1/1234/4567/8900/plans/test/versions').reply(200, {
        version: 1,
        version_description: 'Test Version',
        version_documents: []
      });
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          orgId: 1234,
          accountId: 4567,
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret'
        }
      })
    )
    .stdout()
    .command([
      'planning:data-plan-versions:create',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
      '--config=mp.config.json'
    ])
    .it(
      'returns a data plan version with valid credentials in a config file',
      ctx => {
        expect(ctx.stdout.trim()).to.equals(
          "Created Data Plan Version: 'test:v1'"
        );
      }
    );

  test
    .stdout()
    .command([
      'planning:data-plan-versions:create',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion)
    ])
    .catch('Invalid Credentials for generating API Request')
    .it('returns an error if credentials are missing');

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          orgId: 1234,
          accountId: 4567,
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret'
        }
      })
    )
    .stdout()
    .command(['planning:data-plan-versions:create', '--config=mp.config.json'])
    .catch('Please provide a Data Plan Version to create')
    .it('returns an error if data plan version is missing');
});

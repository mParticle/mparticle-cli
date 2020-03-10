import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:create', () => {
  const sampleDataPlan = { data_plan_name: 'Test' };

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
      api.post('/planning/v1/1234/4567/8900/plans').reply(200, {
        data_plan_id: 'test',
        data_plan_name: 'Test'
      });
    })
    .stdout()
    .command([
      'planning:data-plans:create',
      '--workspaceId=8900',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a success message', ctx => {
      expect(ctx.stdout.trim()).to.equals("Created Data Plan with ID 'test'");
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
      api.post('/planning/v1/1234/4567/8900/plans').reply(200, {
        data_plan_id: 'test',
        data_plan_name: 'Test'
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
      'planning:data-plans:create',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--config=mp.config.json'
    ])
    .it('returns a data plan with valid credentials in a config file', ctx => {
      expect(ctx.stdout.trim()).to.equals("Created Data Plan with ID 'test'");
    });

  test
    .stdout()
    .command([
      'planning:data-plans:create',
      '--dataPlan=' + JSON.stringify(sampleDataPlan)
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
    .command(['planning:data-plans:create', '--config=mp.config.json'])
    .catch('Please provide a Data Plan to create')
    .it('returns an error if data plan is missing');
});

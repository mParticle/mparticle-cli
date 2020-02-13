import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:fetch', () => {
  const sampleDataPlan = { fake_data_plan: 'this is fake' };
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
        .get('/planning/v1/1234/4567/8900/plans/foo')
        .reply(200, sampleDataPlan);
    })
    .stdout()
    .command([
      'planning:data-plans:fetch',
      '--orgId=1234',
      '--accountId=4567',
      '--workspaceId=8900',
      '--dataPlanId=foo',
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a data plan with valid arguments', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlan, null, 4).trim()
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
      api
        .get('/planning/v1/1234/4567/8900/plans/foo')
        .reply(200, sampleDataPlan);
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
      'planning:data-plans:fetch',
      '--dataPlanId=foo',
      '--config=mp.config.json'
    ])
    .it('returns a data plan with valid credentials in a config file', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlan, null, 4).trim()
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
      api
        .get('/planning/v1/1234/4567/8900/plans/test')
        .reply(200, sampleDataPlan);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          orgId: 1234,
          accountId: 4567,
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret'
        },
        planningConfig: {
          dataPlanId: 'test'
        }
      })
    )
    .stdout()
    .command(['planning:data-plans:fetch', '--config=mp.config.json'])
    .it('returns a data plan with a full config file', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlan, null, 4).trim()
      );
    });

  test
    .stdout()
    .command(['planning:data-plans:fetch', '--dataPlanId=foo'])
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
    .command(['planning:data-plans:fetch', '--config=mp.config.json'])
    .catch('Missing Data Plan ID')
    .it('returns an error if data plan id is missing');
});

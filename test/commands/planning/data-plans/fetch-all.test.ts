import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import { config } from '../../../../src/utils/config';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:fetch-all', () => {
  const sampleDataPlanCollection = [{ fake_data_plan: 'this is fake' }];
  test
    .nock(config.auth.apiRoot, (api) => {
      api
        .post(`/${config.auth.path}`, {
          client_id: 'client',
          client_secret: 'secret',
          audience: config.auth.audienceUrl,
          grant_type: config.auth.grant_type,
        })
        .reply(200, {
          access_token: 'DAS token',
          expires_in: 5,
          token_type: 'Bearer',
        });
    })
    .nock(config.apiRoot, (api) => {
      api
        .get(`/${config.dataPlanningPath}/8900/plans`)
        .reply(200, sampleDataPlanCollection);
    })
    .stdout()
    .command([
      'planning:data-plans:fetch-all',
      '--workspaceId=8900',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a data plan with valid arguments', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlanCollection, null, 4).trim()
      );
    });

  test
    .nock(config.auth.apiRoot, (api) => {
      api
        .post('/oauth/token', {
          client_id: 'client',
          client_secret: 'secret',
          audience: config.auth.audienceUrl,
          grant_type: config.auth.grant_type,
        })
        .reply(200, {
          access_token: 'DAS token',
          expires_in: 5,
          token_type: 'Bearer',
        });
    })
    .nock(config.apiRoot, (api) => {
      api
        .get(`/${config.dataPlanningPath}/8900/plans`)
        .reply(200, sampleDataPlanCollection);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: '8900',
          clientId: 'client',
          clientSecret: 'secret',
        },
      })
    )
    .stdout()
    .command(['planning:data-plans:fetch-all', '--config=mp.config.json'])
    .it(
      'returns a data plan with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals(
          JSON.stringify(sampleDataPlanCollection, null, 4).trim()
        );
      }
    );

  test
    .nock(config.auth.apiRoot, (api) => {
      api
        .post('/oauth/token', {
          client_id: 'client',
          client_secret: 'secret',
          audience: config.auth.audienceUrl,
          grant_type: config.auth.grant_type,
        })
        .reply(200, {
          access_token: 'DAS token',
          expires_in: 5,
          token_type: 'Bearer',
        });
    })
    .nock(config.apiRoot, (api) => {
      api
        .get(`/${config.dataPlanningPath}/8900/plans`)
        .reply(200, sampleDataPlanCollection);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: '8900',
          clientId: 'client',
          clientSecret: 'secret',
        },
      })
    )
    .stdout()
    .command(['planning:data-plans:fetch-all', '--config=mp.config.json'])
    .it('returns data plans with a full config file', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlanCollection, null, 4).trim()
      );
    });

  test
    .stdout()
    .command(['planning:data-plans:fetch-all'])
    .catch('Missing API Credentials')
    .it('returns an error if credentials are missing');

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: '12345',
          clientSecret: 'XXXXXXX',
        },
      })
    )
    .stdout()
    .command(['planning:data-plans:fetch-all'])
    .catch("data.global should have required property 'clientId'")
    .it('returns a validation error if config file has invalid JSON');

  test
    .nock(config.auth.apiRoot, (api) => {
      api
        .post(`/${config.auth.path}`, {
          client_id: 'client',
          client_secret: 'secret',
          audience: config.auth.audienceUrl,
          grant_type: config.auth.grant_type,
        })
        .reply(200, {
          access_token: 'DAS token',
          expires_in: 5,
          token_type: 'Bearer',
        });
    })
    .nock(config.apiRoot, (api) => {
      api.get(`/${config.dataPlanningPath}/8900/plans`).reply(403, {
        errors: [
          {
            message: 'You do not have permission to perform this operation',
          },
        ],
      });
    })
    .stdout()
    .command([
      'planning:data-plans:fetch-all',
      '--workspaceId=8900',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Fetch All Failed:\n - You do not have permission to perform this operation'
    )
    .it('returns errors as a list');
});

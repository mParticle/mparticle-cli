import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import nock from 'nock';
import { config } from '../../../../src/utils/config';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:create', () => {
  const sampleDataPlan = { data_plan_name: 'Test' };

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
      api.post(`/${config.dataPlanningPath}/8900/plans`).reply(200, {
        data_plan_id: 'test',
        data_plan_name: 'Test',
      });
    })
    .stdout()
    .command([
      'planning:data-plans:create',
      '--workspaceId=8900',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals("Created Data Plan with ID 'test'");
    });

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
      api.post(`/${config.dataPlanningPath}/8900/plans`).reply(200, {
        data_plan_id: 'test',
        data_plan_name: 'Test',
      });
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
    .command([
      'planning:data-plans:create',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--config=mp.config.json',
    ])
    .it(
      'returns a data plan with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals("Created Data Plan with ID 'test'");
      }
    );

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {},
      })
    )
    .stdout()
    .command([
      'planning:data-plans:create',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
    ])
    .catch('Missing API Credentials')
    .it('returns an error if credentials are missing');

  test
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
    .command(['planning:data-plans:create', '--config=mp.config.json'])
    .catch('Please provide a Data Plan to create')
    .it('returns an error if data plan is missing');

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
      api.post(`/${config.dataPlanningPath}/8900/plans`).reply(400, {
        errors: [
          {
            message: 'Plan ID is already in use.',
          },
          {
            message: 'Something else is wrong',
          },
        ],
      });
    })
    .stdout()
    .command([
      'planning:data-plans:create',
      '--workspaceId=8900',
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Creation Failed:\n - Plan ID is already in use.\n - Something else is wrong'
    )
    .it('returns errors as a list');
});

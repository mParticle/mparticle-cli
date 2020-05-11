import { expect, test } from '@oclif/test';
import nock from 'nock';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import { config } from '../../../../src/utils/config';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:update', () => {
  const updatedDataPlan = {
    data_plan_id: 'test',
    data_plan_name: 'Test',
    data_plan_description: 'This is my test',
  };

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
        .patch(`/${config.dataPlanningPath}/8900/plans/test`)
        .reply(200, updatedDataPlan);
    })
    .stdout()
    .command([
      'planning:data-plans:update',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlan=' + JSON.stringify(updatedDataPlan),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals("Updated Data Plan with ID 'test'");
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
      api
        .patch(`/${config.dataPlanningPath}/8900/plans/test`)
        .reply(200, updatedDataPlan);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret',
        },
      })
    )
    .stdout()
    .command([
      'planning:data-plans:update',
      '--dataPlanId=test',
      '--dataPlan=' + JSON.stringify(updatedDataPlan),
      '--config=mp.config.json',
    ])
    .it(
      'returns a data plan with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals("Updated Data Plan with ID 'test'");
      }
    );

  test
    .stdout()
    .command([
      'planning:data-plans:update',
      '--dataPlanId=test',
      '--dataPlan=' + JSON.stringify(updatedDataPlan),
    ])
    .catch('Missing Credentials for generating API Request')
    .it('returns an error if credentials are missing');

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret',
        },
      })
    )
    .stdout()
    .command(['planning:data-plans:update', '--config=mp.config.json'])
    .catch('Please provide a Data Plan to update')
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
      api.patch(`/${config.dataPlanningPath}/8900/plans/test`).reply(400, {
        errors: [
          {
            message: 'Something else is wrong',
          },
        ],
      });
    })
    .stdout()
    .command([
      'planning:data-plans:update',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlan=' + JSON.stringify(updatedDataPlan),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch('Data Plan Update Failed:\n - Something else is wrong')
    .it('returns errors as a list');
});

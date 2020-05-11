import { expect, test } from '@oclif/test';
import nock from 'nock';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import { config } from '../../../../src/utils/config';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:update', () => {
  const updatedDataPlanVersion = {
    data_plan_id: 'test',
    data_plan_name: 'Test',
    version: 4,
    version_description: 'Test Version',
    version_document: [],
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
        .patch(`/${config.dataPlanningPath}/8900/plans/test/versions/4`)
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
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        "Updated Data Plan Version: 'test:v4'"
      );
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
        .patch(`/${config.dataPlanningPath}/8900/plans/test/versions/4`)
        .reply(200, updatedDataPlanVersion);
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
      'planning:data-plan-versions:update',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(updatedDataPlanVersion),
      '--versionNumber=4',
      '--config=mp.config.json',
    ])
    .it(
      'returns a data plan version with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals(
          "Updated Data Plan Version: 'test:v4'"
        );
      }
    );

  test
    .stdout()
    .command([
      'planning:data-plan-versions:update',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(updatedDataPlanVersion),
      '--versionNumber=4',
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
    .command(['planning:data-plan-versions:update', '--config=mp.config.json'])
    .catch('Please provide a Data Plan Version to update')
    .it('returns an error if data plan version is missing');

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
    .command([
      'planning:data-plan-versions:update',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(updatedDataPlanVersion),
      '--config=mp.config.json',
    ])
    .catch('Missing Data Plan ID and Version Number')
    .it('returns an error if versionNumber is missing');

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
        .patch(`/${config.dataPlanningPath}/8900/plans/test/versions/6`)
        .reply(400, {
          errors: [
            {
              message: 'Something else is wrong',
            },
          ],
        });
    })
    .stdout()
    .command([
      'planning:data-plan-versions:update',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(updatedDataPlanVersion),
      '--versionNumber=6',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch('Data Plan Version Update Failed:\n - Something else is wrong')
    .it('returns errors as a list');
});

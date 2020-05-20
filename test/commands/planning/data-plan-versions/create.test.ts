import { expect, test } from '@oclif/test';
import nock from 'nock';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import { config } from '../../../../src/utils/config';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:create', () => {
  const sampleDataPlanVersion = {
    version: 1,
    version_description: 'Test Version',
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
        .post(`/${config.dataPlanningPath}/8900/plans/test/versions`)
        .reply(200, sampleDataPlanVersion);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:create',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        "Created Data Plan Version: 'test:v1'"
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
        .post(`/${config.dataPlanningPath}/8900/plans/test/versions`)
        .reply(200, {
          version: 1,
          version_description: 'Test Version',
          version_documents: [],
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
      'planning:data-plan-versions:create',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
      '--config=mp.config.json',
    ])
    .it(
      'returns a data plan version with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals(
          "Created Data Plan Version: 'test:v1'"
        );
      }
    );

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          clientSecret: 'secret',
        },
      })
    )
    .stdout()
    .command([
      'planning:data-plan-versions:create',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
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
    .command([
      'planning:data-plan-versions:create',
      '--config=mp.config.json',
      '--dataPlanId=test',
    ])
    .catch('Please provide a Data Plan Version to create')
    .it('returns an error if data plan version is missing');

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
        .post(`/${config.dataPlanningPath}/8900/plans/test/versions`)
        .reply(400, {
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
      'planning:data-plan-versions:create',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--dataPlanVersion=' + JSON.stringify(sampleDataPlanVersion),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Version Creation Failed:\n - Plan ID is already in use.\n - Something else is wrong'
    )
    .it('returns errors as a list');
});

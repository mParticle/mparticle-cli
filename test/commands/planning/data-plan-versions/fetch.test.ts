import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import { config } from '../../../../src/utils/config';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:fetch', () => {
  const sampleDocument = {
    data_plan_id: 'test',
    data_plan_name: 'Test',
    version: 3,
    data_points: [],
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
        .get(`/${config.dataPlanningPath}/8900/plans/foo/versions/3`)
        .reply(200, sampleDocument);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--workspaceId=8900',
      '--dataPlanId=foo',
      '--versionNumber=3',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a version document with valid arguments', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDocument, null, 4).trim()
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
        .get(`/${config.dataPlanningPath}/8900/plans/test/versions/3`)
        .reply(200, sampleDocument);
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
      'planning:data-plan-versions:fetch',
      '--dataPlanId=test',
      '--versionNumber=3',
      '--config=mp.config.json',
    ])
    .it(
      'returns a data plan version with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals(
          JSON.stringify(sampleDocument, null, 4).trim()
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
        .get(`/${config.dataPlanningPath}/8900/plans/test/versions/2`)
        .reply(200, sampleDocument);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: 8900,
          clientId: 'client',
          clientSecret: 'secret',
        },
        planningConfig: {
          dataPlanId: 'test',
          versionNumber: 2,
        },
      })
    )
    .stdout()
    .command(['planning:data-plan-versions:fetch', '--config=mp.config.json'])
    .it('returns a data plan version with full config file', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDocument, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--dataPlanId=foo',
      '--versionNumber=3',
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
    .command(['planning:data-plan-versions:fetch', '--config=mp.config.json'])
    .catch('Missing Data Plan ID and Version Number')
    .it('returns an error if data plan id is missing');

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
      'planning:data-plan-versions:fetch',
      '--dataPlanId=test',
      '--config=mp.config.json',
    ])
    .catch('Missing Data Plan ID and Version Number')
    .it('returns an error if version number is missing');

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
        .get(`/${config.dataPlanningPath}/8900/plans/test/versions/4`)
        .reply(404, {
          errors: [
            {
              message: 'The specified plan ID test was not found',
            },
          ],
        });
    })
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--versionNumber=4',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Version Fetch Failed:\n - The specified plan ID test was not found'
    )
    .it('returns errors as a list');
});

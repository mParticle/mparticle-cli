import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';
import cli from 'cli-ux';
import nock from 'nock';
import { config } from '../../../../src/utils/config';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plan-versions:delete', () => {
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
        .delete(`/${config.dataPlanningPath}/8900/plans/test/versions/5`)
        .reply(200);
    })
    .stub(cli, 'confirm', () => async () => 'yes')
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--versionNumber=5',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        "Deleted Data Plan Version: 'test:v5'"
      );
    });

  test
    .stub(cli, 'confirm', () => async () => 'no')
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--versionNumber=5',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .exit(2)
    .it('exits if confirmation is no');

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
        .delete(`/${config.dataPlanningPath}/8900/plans/test/versions/5`)
        .reply(200);
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
    .stub(cli, 'confirm', () => async () => 'yes')
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--dataPlanId=test',
      '--versionNumber=5',
      '--config=mp.config.json',
    ])
    .it(
      'deletes a data plan version with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals(
          "Deleted Data Plan Version: 'test:v5'"
        );
      }
    );

  test
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--dataPlanId=test',
      '--versionNumber=5',
    ])
    .catch('Missing API Credentials')
    .it('returns an error if credentials are missing');

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: 12345,
          clientId: 'XXXXXX',
          clientSecret: 'XXXXXXX',
        },
      })
    )
    .stdout()
    .command(['planning:data-plan-versions:delete'])
    .catch('data.global.workspaceId should be string')
    .it('returns a validation error if config file has invalid JSON');

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
    .command(['planning:data-plan-versions:delete', '--config=mp.config.json'])
    .catch('Missing Data Plan ID and Version Number')
    .it('returns an error if data plan id is missing');

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
      'planning:data-plan-versions:delete',
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
        .delete(`/${config.dataPlanningPath}/8900/plans/test/versions/6`)
        .reply(404, {
          errors: [
            {
              message: 'The specified plan ID test was not found',
            },
          ],
        });
    })
    .stub(cli, 'confirm', () => async () => 'yes')
    .stdout()
    .command([
      'planning:data-plan-versions:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--versionNumber=6',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Version Delete Failed:\n - The specified plan ID test was not found'
    )
    .it('returns errors as a list');
});

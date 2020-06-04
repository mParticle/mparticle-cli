import { expect, test } from '@oclif/test';
import cli from 'cli-ux';
import nock from 'nock';
import { config } from '../../../../src/utils/config';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

describe('planning:data-plans:delete', () => {
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
      api.delete(`/${config.dataPlanningPath}/8900/plans/test`).reply(200);
    })
    .stub(cli, 'confirm', () => async () => 'yes')
    .stdout()
    .command([
      'planning:data-plans:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('returns a success message', (ctx) => {
      expect(ctx.stdout.trim()).to.equals("Deleted Data Plan with ID 'test'");
    });

  test
    .stub(cli, 'confirm', () => async () => 'no')
    .stdout()
    .command([
      'planning:data-plans:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
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
      api.delete(`/${config.dataPlanningPath}/8900/plans/test`).reply(200);
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
      'planning:data-plans:delete',
      '--dataPlanId=test',
      '--config=mp.config.json',
    ])
    .it(
      'deletes a data plan with valid credentials in a config file',
      (ctx) => {
        expect(ctx.stdout.trim()).to.equals("Deleted Data Plan with ID 'test'");
      }
    );

  test
    .stdout()
    .command(['planning:data-plans:delete', '--dataPlanId='])
    .catch('Missing API Credentials')
    .it('returns an error if credentials are missing');

  test
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          workspaceId: '12345',
          clientId: 213423,
        },
      })
    )
    .stdout()
    .command(['planning:data-plans:delete', '--dataPlanId=test'])
    .catch('data.global.clientId should be string')
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
    .command(['planning:data-plans:delete', '--config=mp.config.json'])
    .catch('Missing Data Plan ID')
    .it('returns an error if data plan id is missing');

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
      api.delete(`/${config.dataPlanningPath}/8900/plans/test`).reply(404, {
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
      'planning:data-plans:delete',
      '--workspaceId=8900',
      '--dataPlanId=test',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch(
      'Data Plan Delete Failed:\n - The specified plan ID test was not found'
    )
    .it('returns errors as a list');
});

import { expect, test } from '@oclif/test';
import { JSONFileSync } from '../../../../src/utils/JSONFileSync';

describe('planning:data-plan-versions:fetch', () => {
  const sampleDocument = { version: 3, data_points: [] };
  test
    .nock('https://sso.auth.mparticle.com', api => {
      api.post('/oauth/token').reply(200, {
        access_token: 'DAS token',
        expires_in: 5,
        token_type: 'Bearer'
      });
    })
    .nock('https://api.mparticle.com', api => {
      api
        .get('/planning/v1/1234/4567/8900/plans/foo/versions/3')
        .reply(200, sampleDocument);
    })
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--orgId=1234',
      '--accountId=4567',
      '--workspaceId=8900',
      '--dataPlanId=foo',
      '--versionNumber=3',
      '--clientId=client',
      '--clientSecret=secret'
    ])
    .it('returns a version document with valid arguments', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDocument, null, 4).trim()
      );
    });

  test
    .nock('https://api.mparticle.com', api => {
      api
        .get('/planning/v1/1234/4567/8900/plans/test/versions/3')
        .reply(200, sampleDocument);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          orgId: 1234,
          accountId: 4567,
          workspaceId: 8900,
          clientId: 'foo',
          clientSecret: 'bar'
        }
      })
    )
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--dataPlanId=test',
      '--versionNumber=3',
      '--config=mp.config.json'
    ])
    .it(
      'returns a data plan version with valid credentials in a config file',
      ctx => {
        expect(ctx.stdout.trim()).to.equals(
          JSON.stringify(sampleDocument, null, 4).trim()
        );
      }
    );

  test
    .nock('https://api.mparticle.com', api => {
      api
        .get('/planning/v1/1234/4567/8900/plans/test/versions/2')
        .reply(200, sampleDocument);
    })
    .stub(JSONFileSync.prototype, 'read', () =>
      JSON.stringify({
        global: {
          orgId: 1234,
          accountId: 4567,
          workspaceId: 8900,
          clientId: 'foo',
          clientSecret: 'bar'
        },
        planningConfig: {
          dataPlanId: 'test',
          versionNumber: 2
        }
      })
    )
    .stdout()
    .command(['planning:data-plan-versions:fetch', '--config=mp.config.json'])
    .it('returns a data plan version with full config file', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDocument, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:data-plan-versions:fetch',
      '--dataPlanId=foo',
      '--versionNumber=3'
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
          clientId: 'foo',
          clientSecret: 'bar'
        }
      })
    )
    .stdout()
    .command(['planning:data-plan-versions:fetch', '--config=mp.config.json'])
    .catch('Missing Data Plan ID and Version Number')
    .it('returns an error if data plan id and version are missing');
});

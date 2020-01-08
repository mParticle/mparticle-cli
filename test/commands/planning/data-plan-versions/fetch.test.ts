import { expect, test } from '@oclif/test';

describe('planning:data-plan-versions:fetch', () => {
  const sampleDocument = { version: 3, data_points: [] };

  test
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
      '--token=TEST'
    ])
    .it('returns a version document with valid arguments', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDocument, null, 4).trim()
      );
    });
});

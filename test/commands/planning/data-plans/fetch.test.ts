import { expect, test } from '@oclif/test';

describe('planning:data-plans:fetch', () => {
  const sampleDataPlan = { fake_data_plan: 'this is fake' };
  test
    .nock('https://api.mparticle.com', api => {
      api
        .get('/planning/v1/1234/4567/8900/plans/foo')
        .reply(200, sampleDataPlan);
    })
    .stdout()
    .command([
      'planning:data-plans:fetch',
      '--orgId=1234',
      '--accountId=4567',
      '--workspaceId=8900',
      '--dataPlanId=foo',
      '--token=TEST'
    ])
    .it('returns a data plan with valid arguments', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(sampleDataPlan, null, 4).trim()
      );
    });
});

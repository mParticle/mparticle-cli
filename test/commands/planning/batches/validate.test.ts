import { expect, test } from '@oclif/test';
import { sampleVersion, sampleDataPlan } from '../../../fixtures/data_plan';
import { config } from '../../../../src/utils/config';
import { sampleBatch } from '../../../fixtures/batch';
import nock from 'nock';

// Prevent CLI from hitting the interwebs
nock.disableNetConnect();

const expectedResults = {
  batch: sampleBatch,
  results: [
    {
      event_type: 'validation_result',
      data: {
        match: {
          type: 'custom_event',
          criteria: {
            event_name: 'Test Event',
            custom_event_type: 'other',
          },
        },
        validation_errors: [
          {
            validation_error_type: 'unplanned',
            key: 'Test Event',
            error_pointer: '#',
          },
        ],
      },
    },
    {
      event_type: 'validation_result',
      data: {
        match: {
          type: 'user_attributes',
        },
        validation_errors: [
          {
            validation_error_type: 'unknown',
            error_pointer: '#',
            actual: 'Invalid JSON Schema',
            key: 'user_attributes',
          },
        ],
      },
    },
  ],
};

describe('planning:batches:validate', () => {
  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--workspaceId=8900',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--versionNumber=1',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('validates a batch with a Data Plan and Version Number', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--workspaceId=8900',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlanVersion=' + JSON.stringify(sampleVersion),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('validates a batch with a Data Plan Version', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--workspaceId=8900',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch('Please provide a batch')
    .it('returns an error when batch is missing');

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--workspaceId=8900',
      '--batch=' + JSON.stringify(sampleBatch),
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch('Please provide a Data Plan or Version Document to Validate against')
    .it('returns an error when data plan is missing');

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
    ])
    .catch('--versionNumber= must also be provided when using --dataPlan=')
    .it('returns an error when data plan is not paired with a version number');

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
        .post(`/${config.dataPlanningPath}/8900/plans/validate`)
        .reply(200, expectedResults);
    })
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--workspaceId=8900',
      '--versionNumber=1',
      '--serverMode',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .it('validates a batch on the server with serverMode enabled', (ctx) => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
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
      api.post(`/${config.dataPlanningPath}/8900/plans/validate`).reply(400, {
        errors: [
          {
            message: 'A required value was missing.',
          },
        ],
      });
    })
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--workspaceId=8900',
      '--versionNumber=1',
      '--serverMode',
      '--clientId=client',
      '--clientSecret=secret',
    ])
    .catch('Server Validation Failed:\n - A required value was missing.')
    .it('returns a formatted error if server an HTTP Error ');
});

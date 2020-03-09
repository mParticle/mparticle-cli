import { expect, test } from '@oclif/test';
import { sampleVersion, sampleDataPlan } from '../../../fixtures/data_plan';
import { sampleBatch } from '../../../fixtures/batch';

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
            custom_event_type: 'other'
          }
        },
        validation_errors: [
          {
            validation_error_type: 'unplanned',
            key: 'Test Event',
            error_pointer: '#'
          }
        ]
      }
    },
    {
      event_type: 'validation_result',
      data: {
        match: {
          type: 'user_attributes'
        },
        validation_errors: [
          {
            validation_error_type: 'unknown',
            error_pointer: '#',
            actual: 'Invalid JSON Schema',
            key: 'user_attributes'
          }
        ]
      }
    }
  ]
};

describe('planning:batches:validate', () => {
  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--versionNumber=1'
    ])
    .it('validates a batch with a Data Plan and Version Number', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlanVersion=' + JSON.stringify(sampleVersion)
    ])
    .it('validates a batch with a Data Plan Version', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command(['planning:batches:validate'])
    .catch('Please provide a batch')
    .it('returns an error when batch is missing');

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch)
    ])
    .catch('Please provide a Data Plan or Version Document to Validate against')
    .it('returns an error when data plan is missing');

  test
    .stdout()
    .command([
      'planning:batches:validate',
      '--batch=' + JSON.stringify(sampleBatch),
      '--dataPlan=' + JSON.stringify(sampleDataPlan)
    ])
    .catch('--versionNumber= must also be provided when using --dataPlan=')
    .it('returns an error when data plan is not paired with a version number');
});

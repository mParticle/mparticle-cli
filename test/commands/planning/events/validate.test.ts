import { expect, test } from '@oclif/test';
import { sampleVersion, sampleDataPlan } from '../../../fixtures/data_plan';

const sampleEvent = {
  event_type: 'custom_event',
  data: {
    event_name: 'Test Event',
    custom_event_type: 'other'
  }
};

const minifiedEvent = {
  dt: 'e',
  n: 'Test Event',
  et: 'other'
};

const expectedResults = {
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
    }
  ]
};

describe('planning:events:validate', () => {
  test
    .stdout()
    .command([
      'planning:events:validate',
      '--event=' + JSON.stringify(sampleEvent),
      '--dataPlan=' + JSON.stringify(sampleDataPlan),
      '--versionNumber=1'
    ])
    .it('validates an event with a Data Plan and Version Number', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:events:validate',
      '--event=' + JSON.stringify(sampleEvent),
      '--dataPlanVersion=' + JSON.stringify(sampleVersion)
    ])
    .it('validates an event with a Data Plan Version', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command([
      'planning:events:validate',
      '--event=' + JSON.stringify(minifiedEvent),
      '--dataPlanVersion=' + JSON.stringify(sampleVersion),
      '--translateEvents'
    ])
    .it('validates a minified event', ctx => {
      expect(ctx.stdout.trim()).to.equals(
        JSON.stringify(expectedResults, null, 4).trim()
      );
    });

  test
    .stdout()
    .command(['planning:events:validate'])
    .catch('Please provide an event')
    .it('returns an error when an event is missing');

  test
    .stdout()
    .command([
      'planning:events:validate',
      '--event=' + JSON.stringify(sampleEvent)
    ])
    .catch('Please provide a Data Plan or Version Document to Validate against')
    .it('returns an error when data plan is missing');

  test
    .stdout()
    .command([
      'planning:events:validate',
      '--event=' + JSON.stringify(sampleEvent),
      '--dataPlan=' + JSON.stringify(sampleDataPlan)
    ])
    .catch('--versionNumber= must also be provided when using --dataPlan=')
    .it('returns an error when data plan is not paired with a version number');
});

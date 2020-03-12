import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { BaseEvent } from '@mparticle/event-models';
import { DataPlan, DataPlanVersion } from '@mparticle/data-planning-models';
import { expand } from '@mparticle/model-translation';

const pjson = require('../../../../package.json');

export default class DataPlanEventValidate extends Base {
  static description = `Validates an Event
 
Data Plans are comprised of one or more Data Plan Versions and are used to validate an Event.
  
A Data Plan Version can be directly referenced by using either the --dataPlanVersion or --dataPlanVersionFile flags
Otherwise, a --dataPlan or --dataPlanFile must be accompanied by a --versionNumber.
For more information, visit: ${pjson.homepage}
`;

  static aliases = ['plan:e:val'];

  static examples = [
    `$ mp planning:events:validate --event=[EVENT] --dataPlan=[DATA_PLAN] --versionNumber=[VERSION_NUMBER]`,
    `$ mp planning:events:validate --event=[EVENT] --dataPlanVersion=[DATA_PLAN_VERSION]`,
    `$ mp planning:events:validate --event=[EVENT] --dataPlanVersion=[DATA_PLAN_VERSION] --translateEvents`,
    `$ mp planning:events:validate --eventFile=/path/to/event --dataPlanFile=/path/to/dataplan --versionNumber=[VERSION_NUMBER]`,
    `$ mp planning:events:validate --eventFile=/path/to/event --dataPlanVersionFile=/path/to/dataplanversio`,
    `$ mp planning:events:validate --eventFile=/path/to/event --dataPlanVersionFile=/path/to/dataplanversio --translateEvents`
  ];

  static flags = {
    ...Base.flags,

    event: flags.string({
      description: 'Event as Stringified JSON',
      exclusive: ['eventFile']
    }),
    eventFile: flags.string({
      description: 'Path to saved JSON file of an Event',
      exclusive: ['event']
    }),
    dataPlan: flags.string({
      description: 'Data Plan as Stringified JSON',
      exclusive: ['dataPlanFile'],
      dependsOn: ['versionNumber']
    }),
    dataPlanFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan',
      exclusive: ['dataPlan'],
      dependsOn: ['versionNumber']
    }),

    // required with data plan file str
    versionNumber: flags.integer({
      description: 'Data Plan Version Number'
    }),

    dataPlanVersion: flags.string({
      description: 'Data Plan Version Document as Stringified JSON'
    }),
    dataPlanVersionFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan Version'
    }),

    translateEvents: flags.boolean({
      description: 'Translate minified event into standard event'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanEventValidate);
    const {
      outFile,
      eventFile,
      dataPlanFile,
      dataPlanVersionFile,
      versionNumber,
      translateEvents
    } = flags;

    const eventStr = flags.event;
    const dataPlanStr = flags.dataPlan;
    const dataPlanVersionStr = flags.dataPlanVersion;

    if (!eventStr && !eventFile) {
      this.error('Please provide an event');
    }

    if (
      !dataPlanStr &&
      !dataPlanFile &&
      !dataPlanVersionStr &&
      !dataPlanVersionFile
    ) {
      this.error(
        'Please provide a Data Plan or Version Document to Validate against'
      );
    }

    let initialEvent;

    try {
      initialEvent = getObject<BaseEvent>(eventStr, eventFile);
    } catch (error) {
      this._debugLog('Error Fetching Event Object', error);
      this.error(error);
    }

    let event;

    if (initialEvent && translateEvents) {
      this._debugLog('Event Before Expansion', initialEvent);
      event = expand(initialEvent) as BaseEvent;
    } else {
      event = initialEvent;
    }

    this._debugLog('Event Received', event);

    if (!event) {
      this.error('Event is invalid');
    }

    const dataPlan = getObject<DataPlan>(dataPlanStr, dataPlanFile);

    this._debugLog('Data Plan received', dataPlan);

    let dataPlanVersion = getObject<DataPlanVersion>(
      dataPlanVersionStr,
      dataPlanVersionFile
    );

    this._debugLog('Data Plan Version received', dataPlanVersion);

    if (dataPlan && versionNumber) {
      dataPlanVersion = dataPlan.data_plan_versions?.find(
        (planVersion: DataPlanVersion) => planVersion.version === versionNumber
      );
    }

    if (!dataPlanVersion) {
      this.error('Data Plan Version is Invalid');
    }

    cli.action.start('Validating Event');
    const dataPlanService = new DataPlanService();
    let results;
    try {
      results = dataPlanService.validateEvent(event, dataPlanVersion);
    } catch (error) {
      this._debugLog('Validation Service Error', error);
      this.error('Cannot validate event');
    }

    if (outFile) {
      try {
        cli.action.start('Writing Results');
        const writer = new JSONFileSync(outFile);
        writer.write(results);
      } catch (error) {
        throw new Error(error.toString());
      }
    } else {
      this.log(JSON.stringify(results, null, 4));
    }
    cli.action.stop();
  }
}

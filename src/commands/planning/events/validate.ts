import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
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

  getObject<T>(
    name: 'event' | 'data_plan' | 'version',
    str?: string,
    path?: string
  ): T | undefined {
    if (str) {
      try {
        return JSON.parse(str) as T;
      } catch (error) {
        this.error(`Cannot parse ${name} string as JSON`);
      }
    } else if (path) {
      try {
        const reader = new JSONFileSync(path);
        return JSON.parse(reader.read()) as T;
      } catch (error) {
        this.error(`Cannot read ${name} file`);
      }
    }
  }

  async run() {
    const { flags } = this.parse(DataPlanEventValidate);
    const {
      outFile,
      logLevel,
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

    const initialEvent = this.getObject<BaseEvent>(
      'event',
      eventStr,
      eventFile
    );
    let event;

    if (initialEvent && translateEvents) {
      if (logLevel === 'debug') {
        console.log('Event Before Expansion', initialEvent);
      }
      event = expand(initialEvent) as BaseEvent;
    } else {
      event = initialEvent;
    }

    if (logLevel === 'debug') {
      console.log('Event Received', event);
    }

    if (!event) {
      this.error('Event is invalid');
    }

    const dataPlan = this.getObject<DataPlan>(
      'data_plan',
      dataPlanStr,
      dataPlanFile
    );

    const dataPlanVersion = this.getObject<DataPlanVersion>(
      'version',
      dataPlanVersionStr,
      dataPlanVersionFile
    );

    let document;

    if (dataPlanVersion) {
      document = dataPlanVersion?.version_document;
    } else if (dataPlan && versionNumber) {
      document = dataPlan.data_plan_versions?.find(
        (dataPlanVersion: DataPlanVersion) =>
          dataPlanVersion.version === versionNumber
      )?.version_document;
    }

    if (logLevel === 'debug') {
      console.log('Data Plan Version received', event);
    }

    if (!document) {
      this.error('Data Plan Version is Invalid');
    }

    cli.action.start('Validating Event');
    const dataPlanService = new DataPlanService();
    let results;
    try {
      results = dataPlanService.validateEvent(event, document);
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Validation Service Error', error);
      }
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

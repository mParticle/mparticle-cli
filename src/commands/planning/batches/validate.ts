import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';
import { Batch } from '@mparticle/event-models';
import {
  DataPlan,
  DataPlanDocument,
  DataPlanVersion
} from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanBatchValidate extends Base {
  static description = `Validates Event Batches
 
Data Plans are comprised of one or more Version Documents and are used to validate a Batch.
  
A Data Plan Version can be directly referenced by using either the --dataPlanVersion or --dataPlanVersionFile flags
Otherwise, a --dataPlan or --dataPlanFile must be accompanied by a --versionNumber.

For more information, visit: ${pjson.homepage}

`;

  static aliases = ['plan:b:val'];

  static examples = [
    `$ mp planning:batches:validate --batch=[BATCH] --dataPlan=[DATA_PLAN] --versionNumber=[VERSION_NUMBER]`,
    `$ mp planning:batches:validate --batch=[BATCH] --dataPlanVersion=[DATA_PLAN_VERSION]`,
    `$ mp planning:batches:validate --batchFile=/path/to/batch --dataPlanFile=/path/to/dataplan --versionNumber=[VERSION_NUMBER]`,
    `$ mp planning:batches:validate --batchFile=/path/to/batch --dataPlanVersion=/path/to/dataplanversion`
  ];

  static flags = {
    ...Base.flags,

    batch: flags.string({
      description: 'Batch as Stringified JSON',
      exclusive: ['batchFile']
    }),
    batchFile: flags.string({
      description: 'Path to saved JSON file of a Batch',
      exclusive: ['batch']
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
    })
  };

  getObject<T>(
    name: 'batch' | 'data_plan' | 'version',
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

  getVersionDocument(
    maybeDocument: { [key: string]: any },
    version?: number
  ): DataPlanDocument | undefined {
    if (maybeDocument.version_document) {
      return maybeDocument.version_document;
    } else if (maybeDocument.data_plan_versions && version) {
      return maybeDocument.data_plan_versions?.find(
        (dp_version: DataPlanVersion) => dp_version.version === version
      )?.version_document as DataPlanDocument;
    }
  }

  async run() {
    const { flags } = this.parse(DataPlanBatchValidate);
    const {
      outFile,
      logLevel,
      batchFile,
      dataPlanFile,
      dataPlanVersionFile,
      versionNumber
    } = flags;

    const batchStr = flags.batch;
    const dataPlanStr = flags.dataPlan;
    const dataPlanVersionStr = flags.dataPlanVersion;

    if (!batchStr && !batchFile) {
      this.error('Please provide a batch');
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

    const batch = this.getObject<Batch>('batch', batchStr, batchFile);

    if (!batch) {
      this.error('Batch is invalid');
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
      document = this.getVersionDocument(dataPlanVersion);
    } else if (dataPlan) {
      document = this.getVersionDocument(dataPlan, versionNumber);
    }

    if (!document) {
      this.error('Data Plan Version is Invalid');
    }

    cli.action.start('Validating Batch');
    const dataPlanService = new DataPlanService();
    let results;
    try {
      results = dataPlanService.validateBatch(batch, document);
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Validation Service Error', error);
      }
      this.error('Cannot validate batch');
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
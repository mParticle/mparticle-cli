import { flags } from '@oclif/command';
import Base from '../../../base';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';

const pjson = require('../../../../package.json');

export default class DataPlanVersionFetch extends Base {
  static description = `Fetches a Data Plan Version

Data Plan Versions are a subset of Data Plans and are used to validate batches.
  
A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.

For more information, visit: ${pjson.homepage}

`;

  static aliases = ['plan:dpv:fetch'];

  static examples = [
    `$ mp planning:data-plan-versions:fetch --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER] --workspaceId=[WORKSPACE_ID]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),
    versionNumber: flags.integer({
      description: 'Data Plan Version Number',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionFetch);
    const { outFile } = flags;

    const versionNumber =
      flags.versionNumber ?? this.mPConfig.planningConfig?.versionNumber;
    const dataPlanId =
      flags.dataPlanId ?? this.mPConfig.planningConfig?.dataPlanId;

    if (!dataPlanId || !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = `Fetching Data Plan: ${dataPlanId}:v${versionNumber}`;

    cli.action.start(message);

    let result;
    try {
      result = await dataPlanService.getDataPlanVersion(
        dataPlanId,
        versionNumber
      );
    } catch (error) {
      this._debugLog('Data Plan Version Fetch Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Version Fetch Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }

      this.error(error);
    }

    if (outFile) {
      try {
        cli.action.start(`Saving Data Plan Version to ${outFile}`);
        const writer = new JSONFileSync(outFile);
        writer.write(result);
      } catch (error) {
        this._debugLog('Cannot save Data Plan Version to file', {
          error,
          response: {
            outFile,
            dataPlanVersion: result,
          },
        });
        this.error(`Cannot write output to ${outFile}`);
      }
    } else {
      this.log(JSON.stringify(result, null, 4));
    }
    cli.action.stop();
  }
}

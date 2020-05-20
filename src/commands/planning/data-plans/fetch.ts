import { flags } from '@oclif/command';
import Base from '../../../base';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';

const pjson = require('../../../../package.json');

export default class DataPlanFetch extends Base {
  static description = `Fetches a Data Plan

Data Plans are comprised of one or more Data Plan Versions.
  
A Data Plan can be fetched using your account credentials and using a valid --dataPlanId

For more information, visit: ${pjson.homepage}

`;

  static aliases = ['plan:dp:fetch'];

  static examples = [
    `$ mp planning:data-plan:fetch --dataPlanId=[DATA_PLAN_ID] --workspaceId=[WORKSPACE_ID]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanFetch);
    const { outFile } = flags;

    const dataPlanId =
      flags.dataPlanId ?? this.mPConfig.planningConfig?.dataPlanId;

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    let result;

    const message = `Fetching Data Plan: ${dataPlanId}`;

    cli.action.start(message);

    try {
      result = await dataPlanService.getDataPlan(dataPlanId);
    } catch (error) {
      this._debugLog('Data Plan Fetch Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Fetch Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }
      this.error(error);
    }

    if (outFile) {
      try {
        cli.action.start(`Saving Data Plan to ${outFile}`);
        const writer = new JSONFileSync(outFile);
        writer.write(result);
      } catch (error) {
        this._debugLog('Cannot save Data Plan to file', {
          error,
          response: {
            outFile,
            dataPlan: result,
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

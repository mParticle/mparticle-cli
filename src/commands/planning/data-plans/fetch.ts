import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
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

    workspaceId: flags.integer({
      description: 'mParticle Workspace ID',
    }),

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    clientId: flags.string({
      description: 'Client ID for Platform API',
    }),
    clientSecret: flags.string({
      description: 'Client Secret for Platform API',
    }),

    config: flags.string({
      description: 'mParticle Config JSON File',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanFetch);
    const { outFile, config, logLevel } = flags;

    let configFile;

    if (config) {
      const configReader = new JSONFileSync(config);
      configFile = JSON.parse(configReader.read());
    }

    let workspaceId = configFile?.global?.workspaceId ?? flags.workspaceId;
    let clientId = configFile?.global?.clientId ?? flags.clientId;
    let clientSecret = configFile?.global?.clientSecret ?? flags.clientSecret;
    let dataPlanId = configFile?.planningConfig?.dataPlanId ?? flags.dataPlanId;

    let dataPlanService: DataPlanService;
    try {
      dataPlanService = new DataPlanService({
        workspaceId,
        clientId,
        clientSecret,
      });
    } catch (error) {
      if (logLevel === 'debug') {
        console.error(error);
      }
      this.error(error.message);
    }

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

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
        if (logLevel === 'debug') {
          console.error(error);
        }
        this.error(`Cannot write output to ${outFile}`);
      }
    } else {
      this.log(JSON.stringify(result, null, 4));
    }
    cli.action.stop();
  }
}

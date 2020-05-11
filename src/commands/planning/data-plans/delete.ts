import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';

const pjson = require('../../../../package.json');

export default class DataPlanDelete extends Base {
  static description = `Deletes a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:delete'];

  static examples = [
    `$ mp planning:data-plan:delete --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID]`,
  ];

  static flags = {
    ...Base.flags,

    workspaceId: flags.integer({
      description: 'mParticle Workspace ID',
    }),

    clientId: flags.string({
      description: 'Client ID for Platform API',
    }),
    clientSecret: flags.string({
      description: 'Client Secret for Platform API',
    }),

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    config: flags.string({
      description: 'mParticle Config JSON File',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanDelete);
    const { config, logLevel } = flags;

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

    const message = 'Deleting Data Plan';

    cli.action.start(message);

    try {
      const result = await dataPlanService.deleteDataPlan(dataPlanId);

      this.log(`Deleted Data Plan with ID '${dataPlanId}'`);
    } catch (error) {
      this._debugLog('Data Plan Delete Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Delete Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }

      this.error(error);
    }

    cli.action.stop();
  }
}

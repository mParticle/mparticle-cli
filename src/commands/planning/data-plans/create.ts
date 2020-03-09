import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { DataPlan } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanCreate extends Base {
  static description = `Creates a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:create'];

  static examples = [
    `$ mp planning:data-plan:create --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID] --dataPlan=[DATA_PLAN]`
  ];

  static flags = {
    ...Base.flags,

    accountId: flags.integer({
      description: 'mParticle Account ID'
    }),
    orgId: flags.integer({
      description: 'mParticle Organization ID'
    }),
    workspaceId: flags.integer({
      description: 'mParticle Workspace ID'
    }),

    clientId: flags.string({
      description: 'Client ID for Platform API'
    }),
    clientSecret: flags.string({
      description: 'Client Secret for Platform API'
    }),

    dataPlan: flags.string({
      description: 'Data Plan as Stringified JSON',
      exclusive: ['dataPlanFile']
    }),
    dataPlanFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan',
      exclusive: ['dataPlan']
    }),

    config: flags.string({
      description: 'mParticle Config JSON File'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanCreate);
    const { dataPlanFile, config, logLevel } = flags;

    const dataPlanStr = flags.dataPlan;
    if (!dataPlanStr && !dataPlanFile) {
      this.error('Please provide a Data Plan to create');
    }

    let configFile;

    if (config) {
      const configReader = new JSONFileSync(config);
      configFile = JSON.parse(configReader.read());
    }

    let accountId = configFile?.global?.accountId ?? flags.accountId;
    let orgId = configFile?.global?.orgId ?? flags.orgId;
    let workspaceId = configFile?.global?.workspaceId ?? flags.workspaceId;
    let clientId = configFile?.global?.clientId ?? flags.clientId;
    let clientSecret = configFile?.global?.clientSecret ?? flags.clientSecret;

    let dataPlanService: DataPlanService;
    try {
      dataPlanService = new DataPlanService({
        orgId,
        accountId,
        workspaceId,
        clientId,
        clientSecret
      });
    } catch (error) {
      this._debugLog('Data Plan Service Init Error', {
        error,
        credentials: {
          orgId,
          accountId,
          workspaceId,
          clientId,
          clientSecret
        }
      });
      this.error(error.message);
    }

    const message = 'Creating Data Plan';

    cli.action.start(message);

    let dataPlan;

    try {
      dataPlan = getObject<DataPlan>(dataPlanStr, dataPlanFile);
    } catch (error) {
      this._debugLog('Error Fetching Data Plan Object', error);
      this.error(error);
    }

    if (!dataPlan) {
      this._debugLog('Logging Data Plan object', dataPlan);
      this.error('Data Plan is empty or invalid');
    }

    try {
      const result = await dataPlanService.createDataPlan(dataPlan);
      this.log(`Created Data Plan with ID '${result.data_plan_id}'`);
    } catch (error) {
      this._debugLog('Data Plan Creation Error', error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        this.error(error.response.data.message);
      } else if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';
import { DataPlan } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanDelete extends Base {
  static description = `Deletes a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:delete'];

  static examples = [
    `$ mp planning:data-plan:delete --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID]`
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

    dataPlanId: flags.string({
      description: 'Data Plan ID'
    }),

    config: flags.string({
      description: 'mParticle Config JSON File'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanDelete);
    const { config, logLevel } = flags;

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
    let dataPlanId = configFile?.planningConfig?.dataPlanId ?? flags.dataPlanId;

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
      if (result) {
        this.log(`Deleted Data Plan with ID '${dataPlanId}'`);
      } else {
        this.log(`Could not delete Data Plan ID: '${dataPlanId}'`);
      }
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Data Plan Delete Error', error);
      }

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

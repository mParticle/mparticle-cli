import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { cli } from 'cli-ux';
import { DataPlanVersion } from '@mparticle/data-planning-models';
import { version } from 'punycode';

const pjson = require('../../../../package.json');

export default class DataPlanVersionDelete extends Base {
  static description = `Deletes a Data Plan Version and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dpv:delete'];

  static examples = [
    `$ mp planning:data-plan-versions:delete --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER]`
  ];

  static flags = {
    ...Base.flags,

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

    versionNumber: flags.integer({
      description: 'Data Plan Version Number'
    }),

    config: flags.string({
      description: 'mParticle Config JSON File'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionDelete);
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
    let versionNumber =
      configFile?.planningConfig?.versionNumber ?? flags.versionNumber;

    let dataPlanService: DataPlanService;
    try {
      dataPlanService = new DataPlanService({
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

    if (!dataPlanId && !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
    }

    const message = 'Deleting Data Plan Version';

    cli.action.start(message);

    try {
      const result = await dataPlanService.deleteDataPlanVersion(
        dataPlanId,
        versionNumber
      );
      if (result) {
        this.log(
          `Deleted Data Plan Version: '${dataPlanId}:v${versionNumber}'`
        );
      } else {
        this.log(
          `Could not delete Data Plan Version: '${dataPlanId}:v${versionNumber}'`
        );
      }
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Data Plan Version Delete Error', error);
      }

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

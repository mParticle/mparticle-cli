import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { DataPlanVersion } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanVersionCreate extends Base {
  static description = `Creates a Data Plan Version and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dpv:create'];

  static examples = [
    `$ mp planning:data-plan-versions:create --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --dataPlan=[DATA_PLAN]`
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
    dataPlanVersion: flags.string({
      description: 'Data Plan Version as Stringified JSON',
      exclusive: ['dataPlanVersionFile']
    }),
    dataPlanVersionFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan Version',
      exclusive: ['dataPlanVersion']
    }),

    config: flags.string({
      description: 'mParticle Config JSON File'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionCreate);
    const { dataPlanVersionFile, config, logLevel } = flags;

    const dataPlanVersionStr = flags.dataPlanVersion;
    if (!dataPlanVersionStr && !dataPlanVersionFile) {
      this.error('Please provide a Data Plan Version to create');
    }

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
        clientSecret
      });
    } catch (error) {
      this._debugLog('Cannot create instance of Data Plan Service', {
        error,
        credentials: {
          workspaceId,
          clientId,
          clientSecret
        }
      });
      this.error(error.message);
    }

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

    const message = 'Creating Data Plan';

    cli.action.start(message);

    let dataPlanVersion;

    try {
      dataPlanVersion = getObject<DataPlanVersion>(
        dataPlanVersionStr,
        dataPlanVersionFile
      );
    } catch (error) {
      this._debugLog('Error Fetching Data Plan Version Object', error);
      this.error(error);
    }

    if (!dataPlanVersion) {
      this._debugLog('Logging Data Plan Version object', dataPlanVersion);
      this.error('Data Plan Version is empty or invalid');
    }

    try {
      const result = await dataPlanService.createDataPlanVersion(
        dataPlanId,
        dataPlanVersion
      );
      this.log(`Created Data Plan Version: '${dataPlanId}:v${result.version}'`);
    } catch (error) {
      this._debugLog('Data Plan Version Creation Error', error);

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

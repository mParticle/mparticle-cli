import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
import { JSONFileSync } from '../../../utils/JSONFileSync';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { DataPlanVersion } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanVersionUpdate extends Base {
  static description = `Updates a Data Plan Version and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dpv:update'];

  static examples = [
    `$ mp planning:data-plan-versions:update --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER] --dataPlanVersion=[DATA_PLAN_VERSION]`
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

    versionNumber: flags.integer({
      description: 'Data Plan Version Number'
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

  getObject<T>(name: 'data_plan_version', str?: string, path?: string): T {
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

    throw new Error(`Cannot proceess ${name}`);
  }

  async run() {
    const { flags } = this.parse(DataPlanVersionUpdate);
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

    let accountId = configFile?.global?.accountId ?? flags.accountId;
    let orgId = configFile?.global?.orgId ?? flags.orgId;
    let workspaceId = configFile?.global?.workspaceId ?? flags.workspaceId;
    let clientId = configFile?.global?.clientId ?? flags.clientId;
    let clientSecret = configFile?.global?.clientSecret ?? flags.clientSecret;
    let dataPlanId = configFile?.planningConfig?.dataPlanId ?? flags.dataPlanId;
    let versionNumber =
      configFile?.planningConfig?.versionNumber ?? flags.versionNumber;

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

    if (!dataPlanId && !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
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
      const result = await dataPlanService.updateDataPlanVersion(
        dataPlanId,
        versionNumber,
        dataPlanVersion
      );
      this.log(`Updated Data Plan Version: '${dataPlanId}:v${result.version}'`);
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Data Plan Version Update Error', error);
      }

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

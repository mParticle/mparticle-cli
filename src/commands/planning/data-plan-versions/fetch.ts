import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
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
    `$ mp planning:data-plan-versions:fetch --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER] --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID]`
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

    dataPlanId: flags.string({
      description: 'Data Plan ID'
    }),
    versionNumber: flags.integer({
      description: 'Data Plan Version Number'
    }),

    clientId: flags.string({
      description: 'Client ID for Platform API'
    }),

    clientSecret: flags.string({
      description: 'Client Secret for Platform API'
    }),

    config: flags.string({
      description: 'mParticle Config JSON File'
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionFetch);
    const { outFile, config, logLevel } = flags;

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
    let versionNumber =
      configFile?.planningConfig?.versionNumber ?? flags.versionNumber;
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

    if (!dataPlanId && !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
    }

    let output = {};

    const message = `Fetching Data Plan: ${dataPlanId}:v${versionNumber}`;

    cli.action.start(message);

    try {
      output = await dataPlanService.getVersionDocument(
        dataPlanId,
        versionNumber
      );
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Data Plan Version Fetch Error', error);
      }

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    if (outFile) {
      try {
        cli.action.start(`Saving Data Plan Version to ${outFile}`);
        const writer = new JSONFileSync(outFile);
        writer.write(output);
      } catch (error) {
        if (logLevel === 'debug') {
          console.error(error);
        }
        this.error(`Cannot write output to ${outFile}`);
      }
    } else {
      this.log(JSON.stringify(output, null, 4));
    }
    cli.action.stop();
  }
}

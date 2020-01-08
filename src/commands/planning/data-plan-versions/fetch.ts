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
      description: 'mParticle Account ID',
      required: true
    }),
    orgId: flags.integer({
      description: 'mParticle Organization ID',
      required: true
    }),
    workspaceId: flags.integer({
      description: 'mParticle Workspace ID',
      required: true
    }),

    token: flags.string({
      description: 'mParticle Token',
      required: true
    }),

    dataPlanId: flags.string({
      description: 'Data Plan ID',
      required: true
    }),
    versionNumber: flags.integer({
      description: 'Data Plan Version Number',
      required: true
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionFetch);
    const { logLevel } = flags;

    const {
      dataPlanId,
      outFile,
      token,
      accountId,
      orgId,
      workspaceId,
      versionNumber
    } = flags;

    const dataPlanService = new DataPlanService();

    let output = {};

    const message = `Fetching Data Plan: ${dataPlanId}:v${versionNumber}`;

    cli.action.start(message);

    try {
      output = await dataPlanService.getVersionDocument(
        orgId,
        accountId,
        dataPlanId,
        workspaceId,
        versionNumber,
        token
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

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
    `$ mp planning:data-plan:fetch --dataPlanId=[DATA_PLAN_ID] --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID]`
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
    })
  };

  async run() {
    const { flags } = this.parse(DataPlanFetch);
    const { logLevel } = flags;

    const { dataPlanId, outFile, token, accountId, orgId, workspaceId } = flags;

    const dataPlanService = new DataPlanService();

    let output = {};

    const message = `Fetching Data Plan: ${dataPlanId}`;

    cli.action.start(message);

    try {
      output = await dataPlanService.getPlan(
        orgId,
        accountId,
        dataPlanId,
        workspaceId,
        token
      );
    } catch (error) {
      if (logLevel === 'debug') {
        console.error('Data Plan Fetch Error', error);
      }

      if (error.response && error.response.statusText) {
        this.error(error.response.statusText);
      }
      this.error(error);
    }

    if (outFile) {
      try {
        cli.action.start(`Saving Data Plan to ${outFile}`);
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

import { flags } from '@oclif/command';
import Base from '../../../base';
import { cli } from 'cli-ux';

const pjson = require('../../../../package.json');

export default class DataPlanDelete extends Base {
  static description = `Deletes a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId

  Note: Delete will NOT read dataPlanId from config as a precaution to prevent accidental deletion of records
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:delete'];

  static examples = [
    `$ mp planning:data-plan:delete --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanDelete);

    // Should not read from config to prevent accidental delete
    const dataPlanId = flags.dataPlanId;

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

    const confirmDelete = await cli.confirm('Please confirm deletion [y/n]');

    if (!confirmDelete) {
      cli.action.stop;
      this.exit(0);
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = 'Deleting Data Plan';

    cli.action.start(message);

    try {
      await dataPlanService.deleteDataPlan(dataPlanId);

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

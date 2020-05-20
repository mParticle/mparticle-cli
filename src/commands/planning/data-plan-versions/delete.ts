import { flags } from '@oclif/command';
import Base from '../../../base';
import { cli } from 'cli-ux';

const pjson = require('../../../../package.json');

export default class DataPlanVersionDelete extends Base {
  static description = `Deletes a Data Plan Version and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.

  Note: Delete will NOT read dataPlanId or versionNumber from config as a precaution to prevent accidental deletion of records
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dpv:delete'];

  static examples = [
    `$ mp planning:data-plan-versions:delete --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    versionNumber: flags.integer({
      description: 'Data Plan Version Number',
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionDelete);

    // Should not read from config to prevent accidental delete
    const versionNumber = flags.versionNumber;
    const dataPlanId = flags.dataPlanId;

    if (!dataPlanId || !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
    }

    const confirmDelete = await cli.confirm('Please confirm deletion [y/n]');

    if (!confirmDelete) {
      cli.action.stop;
      this.exit(0);
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = 'Deleting Data Plan Version';

    cli.action.start(message);

    try {
      await dataPlanService.deleteDataPlanVersion(dataPlanId, versionNumber);
      this.log(`Deleted Data Plan Version: '${dataPlanId}:v${versionNumber}'`);
    } catch (error) {
      this._debugLog('Data Plan Version Delete Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Version Delete Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }

      this.error(error);
    }

    cli.action.stop();
  }
}

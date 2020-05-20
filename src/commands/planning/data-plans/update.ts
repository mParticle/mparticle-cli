import { flags } from '@oclif/command';
import Base from '../../../base';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { DataPlan } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanUpdate extends Base {
  static description = `Updates a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:update'];

  static examples = [
    `$ mp planning:data-plan:update --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --dataPlan=[DATA_PLAN]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    dataPlan: flags.string({
      description: 'Data Plan as Stringified JSON',
      exclusive: ['dataPlanFile'],
    }),

    dataPlanFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan',
      exclusive: ['dataPlan'],
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanUpdate);

    const dataPlanId =
      flags.dataPlanId ?? this.mPConfig.planningConfig?.dataPlanId;

    const dataPlanStr = flags.dataPlan;
    const dataPlanFile =
      flags.dataPlanFile ?? this.mPConfig.planningConfig?.dataPlanFile;

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

    if (!dataPlanStr && !dataPlanFile) {
      this.error('Please provide a Data Plan to update');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = 'Upadting Data Plan';

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
      await dataPlanService.updateDataPlan(dataPlanId, dataPlan);

      this.log(`Updated Data Plan with ID '${dataPlanId}'`);
    } catch (error) {
      this._debugLog('Data Plan Update Error', error);
      if (error.errors) {
        const errorMessage = 'Data Plan Update Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

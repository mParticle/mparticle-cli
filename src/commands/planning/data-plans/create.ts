import { flags } from '@oclif/command';
import Base from '../../../base';
import { getObject } from '../../../utils/getObject';
import { cli } from 'cli-ux';
import { DataPlan } from '@mparticle/data-planning-models';

const pjson = require('../../../../package.json');

export default class DataPlanCreate extends Base {
  static description = `Creates a Data Plan and uploads to mParticle

  Data Plans are comprised of one or more Data Plan Versions.
    
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId
  
  For more information, visit: ${pjson.homepage}
  
  `;

  static aliases = ['plan:dp:create'];

  static examples = [
    `$ mp planning:data-plan:create --workspaceId=[WORKSPACE_ID] --dataPlan=[DATA_PLAN]`,
  ];

  static flags = {
    ...Base.flags,

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
    const { flags } = this.parse(DataPlanCreate);

    const dataPlanStr = flags.dataPlan;
    const dataPlanFile =
      flags.dataPlanFile ?? this.mPConfig.planningConfig?.dataPlanFile;

    if (!dataPlanStr && !dataPlanFile) {
      this.error('Please provide a Data Plan to create');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = 'Creating Data Plan';

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
      const result = await dataPlanService.createDataPlan(dataPlan);

      this.log(`Created Data Plan with ID '${result.data_plan_id}'`);
    } catch (error) {
      this._debugLog('Data Plan Creation Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Creation Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }

      this.error(error);
    }

    cli.action.stop();
  }
}

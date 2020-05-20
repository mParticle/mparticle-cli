import { flags } from '@oclif/command';
import Base from '../../../base';
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
    `$ mp planning:data-plan-versions:create --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --dataPlan=[DATA_PLAN]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    dataPlanVersion: flags.string({
      description: 'Data Plan Version as Stringified JSON',
      exclusive: ['dataPlanVersionFile'],
    }),

    dataPlanVersionFile: flags.string({
      description: 'Path to saved JSON file of a Data Plan Version',
      exclusive: ['dataPlanVersion'],
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanVersionCreate);

    const dataPlanId =
      flags.dataPlanId ?? this.mPConfig.planningConfig?.dataPlanId;

    const dataPlanVersionStr = flags.dataPlanVersion;
    const dataPlanVersionFile =
      flags.dataPlanVersionFile ??
      this.mPConfig.planningConfig?.dataPlanVersionFile;

    if (!dataPlanId) {
      this.error('Missing Data Plan ID');
    }

    if (!dataPlanVersionStr && !dataPlanVersionFile) {
      this.error('Please provide a Data Plan Version to create');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

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

      if (error.errors) {
        const errorMessage = 'Data Plan Version Creation Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }
      this.error(error);
    }

    cli.action.stop();
  }
}

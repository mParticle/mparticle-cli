import { flags } from '@oclif/command';
import Base from '../../../base';
import { DataPlanService } from '@mparticle/data-planning-node';
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
    `$ mp planning:data-plan-versions:update --workspaceId=[WORKSPACE_ID] --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER] --dataPlanVersion=[DATA_PLAN_VERSION]`,
  ];

  static flags = {
    ...Base.flags,

    dataPlanId: flags.string({
      description: 'Data Plan ID',
    }),

    versionNumber: flags.integer({
      description: 'Data Plan Version Number',
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
    const { flags } = this.parse(DataPlanVersionUpdate);

    const versionNumber =
      flags.versionNumber ?? this.mPConfig.planningConfig?.versionNumber;
    const dataPlanId =
      flags.dataPlanId ?? this.mPConfig.planningConfig?.dataPlanId;

    const dataPlanVersionStr = flags.dataPlanVersion;
    let dataPlanVersionFile =
      flags.dataPlanVersionFile ??
      this.mPConfig.planningConfig?.dataPlanVersionFile;

    if (!dataPlanId || !versionNumber) {
      this.error('Missing Data Plan ID and Version Number');
    }

    if (!dataPlanVersionStr && !dataPlanVersionFile) {
      this.error('Please provide a Data Plan Version to update');
    }

    const dataPlanService = this.getDataPlanService(this.credentials);

    const message = 'Updating Data Plan Version';

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

      this.log(
        `Updated Data Plan Version: '${result.data_plan_id}:v${result.version}'`
      );
    } catch (error) {
      this._debugLog('Data Plan Version Update Error', error);
      if (error.errors) {
        const errorMessage = 'Data Plan Version Update Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }

      this.error(error);
    }

    cli.action.stop();
  }
}

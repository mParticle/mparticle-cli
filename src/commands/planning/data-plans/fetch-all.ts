import { flags } from '@oclif/command';
import Base from '../../../base';
import { cli } from 'cli-ux';
import { DataPlanVersion } from '@mparticle/data-planning-models';

const path = require('path');
const fs = require('fs');
const pjson = require('../../../../package.json');

export default class DataPlanFetchAll extends Base {
  static description = `Fetches All Data Plans

Data Plans are comprised of one or more Data Plan Versions.
  
All of your Data Plans will be fetched using your account credentials
and saved with the filename format of: <data_plan_id>.<version_number>.json

For more information, visit: ${pjson.homepage}

`;

  static aliases = ['plan:dp:fetchAll'];

  static examples = [
    `$ mp planning:data-plan:fetch-all --workspaceId=[WORKSPACE_ID]`,
  ];

  static flags = {
    ...Base.flags,

    split: flags.boolean({
      char: 's',
      description: 'Split Data Plans into Data Plan Version files',
      dependsOn: ['outPath'],
    }),

    outPath: flags.string({
      description: 'Output path for split files',
      dependsOn: ['split'],
    }),
  };

  async run() {
    const { flags } = this.parse(DataPlanFetchAll);
    const { outFile, outPath, split } = flags;

    const dataPlanService = this.getDataPlanService(this.credentials);

    let result;

    const message = `Fetching All Data Plans`;

    cli.action.start(message);

    try {
      result = await dataPlanService.getDataPlans();
    } catch (error) {
      this._debugLog('Data Plan Fetch All Error', error);

      if (error.errors) {
        const errorMessage = 'Data Plan Fetch All Failed:';
        this.error(this._generateErrorList(errorMessage, error.errors));
      }
      this.error(error);
    }

    if (outPath && split) {
      try {
        // This will throw an error if outPath is not a directory
        // So this will control how the error is rendered
        if (fs.lstatSync(outPath).isDirectory()) {
          cli.action.start(`Saving Data Plan Versions to ${outPath}`);
        }
      } catch (error) {
        this._debugLog('outPath ', error);
        this.error(`outPath is not a valid directory: ${outPath}`);
      }

      cli.action.start(`Saving Data Plan Versions to ${outPath}`);

      result.forEach((result) => {
        result.data_plan_versions?.forEach(async (version) => {
          if (!result.data_plan_id || !version.version) {
            this.error('Invalid Data Plan');
          }

          const versionFile = path.resolve(
            outPath,
            `${result.data_plan_id}-${version.version}.json`
          );

          let versionResult: DataPlanVersion;
          try {
            versionResult = await dataPlanService.getDataPlanVersion(
              result.data_plan_id,
              version.version
            );
          } catch (error) {
            this._debugLog('Data Plan Fetch All Split Error', {
              error,
              versionFile,
            });
            if (error.errors) {
              const errorMessage = 'Data Plan Fetch All Split Failed:';
              this.error(this._generateErrorList(errorMessage, error.errors));
            }
            this.error(error);
          }
          this.writeOutfile(versionFile, versionResult);
        });
      });
    } else if (outFile) {
      this.writeOutfile(outFile, result);
    } else {
      this.log(JSON.stringify(result, null, 4));
    }
    cli.action.stop();
  }
}

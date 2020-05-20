import Command, { flags } from '@oclif/command';
import { Input } from '@oclif/parser';
import { JSONFileSync } from './utils/JSONFileSync';
import mPConfig from './utils/mPConfig';
import {
  AccessCredentials,
  DataPlanService,
} from '@mparticle/data-planning-node';

export default abstract class Base extends Command {
  mPConfig = new mPConfig();
  flags = {
    logLevel: {},
  };
  args = [];
  credentials: AccessCredentials = {
    workspaceId: 0,
    clientId: '',
    clientSecret: '',
  };

  static flags = {
    logLevel: flags.string({
      options: ['error', 'warn', 'info', 'debug', 'silent'],
      default: 'info',
      description: 'Log Level',
    }),

    workspaceId: flags.string({
      description: 'mParticle Workspace ID',
    }),

    config: flags.string({
      description: 'mParticle Config JSON File',
    }),

    clientId: flags.string({
      description: 'Client ID for Platform API',
    }),

    clientSecret: flags.string({
      description: 'Client Secret for Platform API',
    }),

    outFile: flags.string({
      char: 'o',
      description:
        '(optional) Output file for results (defaults to standard output)',
    }),
  };

  static args = [];

  _debugLog(message: string, object?: any) {
    if (this.flags.logLevel === 'debug') {
      console.log(message, JSON.stringify(object, null, 4));
    }
  }

  _generateErrorList(message: string, messages: string[]) {
    return (
      message +
      '\n' +
      messages.map((error: any) => ` - ${error.message}`).join('\n')
    );
  }

  getDataPlanService(credentials: AccessCredentials): DataPlanService {
    try {
      return new DataPlanService(credentials);
    } catch (error) {
      this._debugLog('Cannot create instance of Data Plan Service', {
        error,
        credentials,
      });
      this.error(error.message);
    }
  }

  async init() {
    const { args, flags } = this.parse(<Input<any>>this.constructor);
    this.args = args;
    this.flags = flags;

    const { config } = flags;

    // if they pass a config, read that into mpConfig
    // if the fs has a config file in the root, read that into config
    // if no config, init an empty global config

    // Looks to root of current directory for config file
    const configFile = config ?? 'mp.config.json';
    let configObject;

    try {
      const configReader = new JSONFileSync(configFile);
      configObject = JSON.parse(configReader.read());
    } catch (error) {
      if (error instanceof SyntaxError) {
        this._debugLog('Syntax Error in config file', error);
        this.error('Syntax Error in config file: ' + configFile);
      } else {
        this._debugLog('Cannot read config file', configFile);

        // A config file is not required, but if they request a specific
        // file and it can't be processed, throw an error
        if (config) {
          this.error('Cannot read config file: ' + config);
        }
      }
    }

    this.mPConfig = new mPConfig(configObject);

    const workspaceId = flags.workspaceId ?? this.mPConfig?.workspaceId;
    const clientId = flags.clientId ?? this.mPConfig?.clientId;
    const clientSecret = flags.clientSecret ?? this.mPConfig.clientSecret;

    if (!workspaceId || !clientId || !clientSecret) {
      this.error('Missing API Credentials');
    }

    this.credentials = {
      workspaceId,
      clientId,
      clientSecret,
    };
  }

  async catch(error: Error) {
    const { logLevel } = this.flags || '';

    if (logLevel === 'debug') {
      console.error(error);
    }

    if (logLevel !== 'silent') {
      this.error(error);
    }
  }
  async finally(error: Error) {}
}

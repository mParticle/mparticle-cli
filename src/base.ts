import Command, { flags } from '@oclif/command';
import { Input } from '@oclif/parser';

export default abstract class Base extends Command {
  flags = {
    logLevel: {},
  };
  args = [];

  static flags = {
    logLevel: flags.string({
      options: ['error', 'warn', 'info', 'debug', 'silent'],
      default: 'info',
      description: 'Log Level',
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

  async init() {
    const { args, flags } = this.parse(<Input<any>>this.constructor);
    this.args = args;
    this.flags = flags;
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

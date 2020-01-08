import Command, { flags } from '@oclif/command';
import { Input } from '@oclif/parser';

export default abstract class Base extends Command {
  flags = {
    logLevel: {}
  };
  args = [];

  static flags = {
    logLevel: flags.string({
      options: ['error', 'warn', 'info', 'debug', 'silent'],
      default: 'info',
      description: 'Log Level'
    }),
    outFile: flags.string({
      char: 'o',
      description:
        '(optional) Output file for results (defaults to standard output)'
    })
  };

  static args = [];

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

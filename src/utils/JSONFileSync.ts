import * as fs from 'fs';

export class JSONFileSync {
  constructor(public path: string) {}

  write(data: { [key: string]: any }) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 4));
  }

  read(): string {
    return fs.readFileSync(this.path, { encoding: 'utf8' });
  }
}

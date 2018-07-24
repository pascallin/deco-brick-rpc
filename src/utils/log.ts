import chalk from "chalk";
const cl = console.log;

export class Log {
  private readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  public red(message: string): void {
    cl(chalk.redBright(this.wrapMessage(message)));
  }
  public blue(message: string): void {
    cl(chalk.blueBright(this.wrapMessage(message)));
  }
  public yellow(message: string): void {
    cl(chalk.yellowBright(this.wrapMessage(message)));
  }
  public green(message: string): void {
    cl(chalk.greenBright(this.wrapMessage(message)));
  }
  private wrapMessage(message: string): string {
    return `[${this.name}]: ${message}`;
  }
}

export default function log(name: string): Log {
  return new Log(name);
}

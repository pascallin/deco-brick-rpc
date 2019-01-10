export declare class Log {
    private readonly name;
    constructor(name: string);
    red(message: string): void;
    blue(message: string): void;
    yellow(message: string): void;
    green(message: string): void;
    private wrapMessage;
}
export default function log(name: string): Log;

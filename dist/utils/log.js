"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const cl = console.log;
class Log {
    constructor(name) {
        this.name = name;
    }
    red(message) {
        cl(chalk_1.default.redBright(this.wrapMessage(message)));
    }
    blue(message) {
        cl(chalk_1.default.blueBright(this.wrapMessage(message)));
    }
    yellow(message) {
        cl(chalk_1.default.yellowBright(this.wrapMessage(message)));
    }
    green(message) {
        cl(chalk_1.default.greenBright(this.wrapMessage(message)));
    }
    wrapMessage(message) {
        return `[${this.name}]: ${message}`;
    }
}
exports.Log = Log;
function log(name) {
    return new Log(name);
}
exports.default = log;

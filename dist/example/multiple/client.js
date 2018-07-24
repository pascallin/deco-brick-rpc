"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../../");
const log = console.log;
const koa_1 = __importDefault(require("koa"));
const rpc = new _1.GrpcClient({
    discovery: new _1.EtcdDiscovery({
        namespace: "deco",
        url: "localhost:2379",
    }),
    protoPath: __dirname + "/../test.proto",
});
const app = new koa_1.default();
app.use((ctx) => __awaiter(this, void 0, void 0, function* () {
    ctx.body = yield rpc.rpc().Test.check().sendMessage({ data: "you" });
}));
app.listen(3000);

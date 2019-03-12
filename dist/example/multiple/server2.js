"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../");
class TestService {
    constructor() {
        this.name = "Test";
    }
    check(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return { status: "server 2 success" };
        });
    }
}
const test = new __1.GrpcServer({
    discovery: new __1.EtcdDiscovery({
        namespace: "deco",
        url: "localhost:2379",
    }),
    port: 50052,
    protoPath: __dirname + "/../protos/test.proto",
});
test.setServices([TestService]);
test.start();

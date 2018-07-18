"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getProtoNameByPath(path) {
    const arr = path.split("/");
    return arr[arr.length - 1].split(".")[0];
}
exports.getProtoNameByPath = getProtoNameByPath;

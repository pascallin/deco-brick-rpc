export function getProtoNameByPath(path: string) {
  const arr = path.split("/");
  return arr[arr.length - 1].split(".")[0];
}

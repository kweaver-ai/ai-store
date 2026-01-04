export const isJSONString = (str: string) => {
  try {
    if (JSON.parse(str) instanceof Object) {
      return true
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch {
    // console.log(error);
    return false
  }
}

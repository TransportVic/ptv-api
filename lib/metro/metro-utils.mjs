export default class MetroUtils {
  static getTDNFromRunRef(runRef) {
    let parts
    if (parts = runRef.toString().match(/^9(\d\d)(\d\d\d)$/)) {
      return `${String.fromCharCode(parseInt(parts[1]))}${parts[2]}`
    }

    return null
  }

  static getRunRefFromTDN(tdn) {
    let parts
    if (parts = tdn.toString().match(/^(\w)(\d\d\d)$/)) {
      return `9${parts[1].charCodeAt(0)}${parts[2]}`
    }

    return null
  }
}
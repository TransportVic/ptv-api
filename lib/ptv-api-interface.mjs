import { createHmac } from 'crypto'
import fetch from 'node-fetch'

export class PTVAPIError extends Error {

  constructor(message, code) {
    super(`[${code}] ${message}`)
  }

}

export class PTVAPIInterface {

  constructor(devID, key) {
    this.devID = devID
    this.key = key
  }

  appendDevID(pathname) {
    return pathname + (pathname.includes('?') ? '&' : '?') + 'devid=' + this.devID
  }

  constructURL(pathname) {
    let pathWithDevID = this.appendDevID(pathname)
    let signature = createHmac('SHA1', this.key).update(pathWithDevID).digest('hex').toString('hex')
    return `https://timetableapi.ptv.vic.gov.au${pathWithDevID}&signature=${signature}`
  }

  checkForErrorMessage(responseData) {
    let message = responseData.Message || responseData.message
    if (message) {
      if (message === 'An error has occurred.') throw new PTVAPIError('PTV API Server Error', 'API_SERVER_ERROR')
      else if (message.includes('signature is invalid')) throw new PTVAPIError('Signature Invalid', 'DEVID_KEY_MISMATCH')
      else if (message.includes('is invalid')) throw new PTVAPIError('Dev ID Invalid', 'DEVID_INVALID')
      else if (message.includes('has been disabled')) throw new PTVAPIError('Dev ID Disabled', 'DEVID_DISABLED')
      else throw new PTVAPIError('Unknown PTV API Error ' + message, 'API_UNKNOWN_ERROR')
    }
  }

  checkForAPIStatus(responseData) {
    if (responseData.status && responseData.status.health !== 1) throw new PTVAPIError('PTV API Server Error', 'API_SERVER_ERROR')
  }

  async apiCall(path, requestOptions={}) {
    let fullURL = this.constructURL(path)
    let body = await (await fetch(fullURL, requestOptions)).text()

    let responseData
    try {
      responseData = JSON.parse(body)
    } catch (e) {
      throw new PTVAPIError('Error parsing API Response - Malformed JSON', 'API_BAD_RESPONSE')
    }

    this.checkForErrorMessage(responseData)
    this.checkForAPIStatus(responseData)

    return responseData
  }
}

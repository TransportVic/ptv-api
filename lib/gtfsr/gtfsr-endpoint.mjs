import fetch from 'node-fetch'
import path from 'path'
import url from 'url'
import fs from 'fs/promises'
import protoBuf from 'protocol-buffers'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const protoDefinition = await fs.readFile(path.join(__dirname, '..', '..', 'res', 'ptv-gtfsr.proto'))
const GTFSR = protoBuf(protoDefinition)

export default class GTFSREndpoint {
  
  static API_HOST = 'https://data-exchange-api.vicroads.vic.gov.au'

  #path
  #devKey

  constructor(path, devKey) {
    this.#path = path
    this.#devKey = devKey
  }

  async fetchData() {
    let respose = await fetch(this.constructor.API_HOST + this.#path, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.#devKey
      }
    })
    return Buffer.from(await respose.arrayBuffer())
  }

  async parse(data) {
    return data
  }

  async fetch() {
    return await this.parse(GTFSR.FeedMessage.decode(await this.fetchData()))
  }

}
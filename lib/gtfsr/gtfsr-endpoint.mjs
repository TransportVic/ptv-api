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

  #url
  #devKey

  constructor(url, devKey) {
    this.#url = url
    this.#devKey = devKey
  }

  async fetchData() {
    let respose = await fetch(this.#url, {
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
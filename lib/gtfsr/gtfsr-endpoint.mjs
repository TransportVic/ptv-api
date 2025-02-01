import fetch from 'node-fetch';

export default class GTFSREndpoint {

  #url
  #devKey

  constructor(url, devKey) {
    this.#url = url
    this.#devKey = devKey
  }

  async fetchData() {
    let respose = await fetch(this.#url, {
      "headers": {
        'Ocp-Apim-Subscription-Key': this.#devKey
      }
    })
    return await respose.arrayBuffer()
  }

  async fetch() {

  }

}
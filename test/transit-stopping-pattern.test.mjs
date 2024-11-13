import TransitStoppingPattern from '../lib/types/transit-stopping-pattern.mjs'
import { expect } from 'chai'

describe('The TransitStoppingPattern class', () => {
  describe('The addExpandData function', () => {
    it('Should add expand data if expand is not provided in the parameters', () => {
      let stoppingPattern = new TransitStoppingPattern()
      let parameters = {}
      stoppingPattern.addExpandData(parameters)

      expect(parameters).to.deep.equal({
        expand: ['run', 'stop', 'route', 'direction']
      })
    })
  })
})
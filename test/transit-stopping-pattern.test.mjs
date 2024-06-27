import TransitStoppingPattern from '../lib/types/transit-stopping-pattern.mjs'
import { expect } from 'chai'

describe('The TransitStoppingPattern class', () => {
  describe('The generateQueryString function', () => {
    it('Should turn a dictionary of values into a query string', () => {
      let stoppingPattern = new TransitStoppingPattern()
      let queryString = stoppingPattern.generateQueryString({
        date: new Date('2024-06-27T07:08:14.150Z'),
        expand: ['VehiclePosition', 'VehicleDescriptor']
      })

      expect(queryString).to.equal('?date_utc=2024-06-27T07:08:14.150Z&expand=VehiclePosition&expand=VehicleDescriptor')
    })
  })

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
import { expect } from 'chai'
import { dateLikeToISO, parseISOTime } from '../lib/date-utils.mjs'

describe('The Date utils functions', () => {
  describe('The Melbourne time parser', () => {
    it('Should take a relative timezone timestamp and convert it to a UTC timestamp, across DST periods', () => {
      expect(parseISOTime('2024-07-13T08:12:00').toUTC().toISO()).to.equal('2024-07-12T22:12:00.000Z')
      expect(parseISOTime('2024-02-13T08:12:00').toUTC().toISO()).to.equal('2024-02-12T21:12:00.000Z')
    })
  })

  describe('The dateLikeToISO function', () => {
    it('Should convert native Dates into ISO strings', () => {
      expect(dateLikeToISO(new Date('2024-07-16T00:00:00Z'))).to.equal('2024-07-16T00:00:00.000Z')
    })

    it('Should convert Luxon DateTimes into ISO strings', () => {
      expect(dateLikeToISO(parseISOTime('2024-07-16T00:00:00'))).to.equal('2024-07-15T14:00:00.000Z')
    })

    it('Should pass through regular strings', () => {
      expect(dateLikeToISO('2024-07-16T00:00:00')).to.equal('2024-07-15T14:00:00.000Z')
    })

    it('Should raise an error for invalid date strings', () => {
      expect(dateLikeToISO.bind(null, '2024-99-99')).to.throw('2024-99-99 is not a valid time string!')
    })
  })
})
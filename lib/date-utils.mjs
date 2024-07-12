import { DateTime } from 'luxon'

let melbourneTime = 'Australia/Melbourne'

// Note: Need to allow for SA time as PTV does not handle cross border times well... or at all
export function parseISOTime(time) {
  return DateTime.fromISO(time, { zone: melbourneTime })
}

export function parseMSTime(time) {
  return DateTime.fromMillis(time, { zone: melbourneTime })
}
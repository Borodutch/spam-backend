import neynar from '@/helpers//neynar'
import { Cast } from '@standard-crypto/farcaster-js-neynar/dist/commonjs/v1/openapi/generated/models/cast'

export default async function getCasts(fid: number, fromDate?: Date) {
  let casts = [] as Cast[]
  for await (const cast of neynar.v1.fetchCastsForUser(fid)) {
    if (fromDate && new Date(cast.timestamp) <= fromDate) {
      break
    }
    casts.push(cast)
  }
  return casts as (Cast & {
    reactions?: {
      count: number
    }
    recasts?: {
      count: number
    }
  })[]
}

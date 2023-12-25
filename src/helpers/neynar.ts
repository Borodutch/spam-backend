import { NeynarAPIClient } from '@standard-crypto/farcaster-js'
import env from '@/helpers/env'

export default new NeynarAPIClient(env.NEYNAR)

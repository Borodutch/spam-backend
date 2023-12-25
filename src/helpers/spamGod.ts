import env from '@/helpers/env'
import { Wallet } from 'ethers'

export default new Wallet(env.PRIVATE_KEY)

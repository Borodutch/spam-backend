import env from '@/helpers/env'
import { Wallet } from 'ethers'

const spamGod = new Wallet(env.PRIVATE_KEY)

console.log('Spam God:', spamGod.address)

export default spamGod

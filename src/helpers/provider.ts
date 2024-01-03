import { AlchemyProvider } from 'ethers'
import env from '@/helpers/env'

export default new AlchemyProvider(8453, env.ALCHEMY_BASE)

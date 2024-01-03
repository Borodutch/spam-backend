import { Spam__factory } from '@borodutch/spam-contract'
import env from '@/helpers/env'
import provider from '@/helpers/provider'

export default Spam__factory.connect(env.CONTRACT, provider)

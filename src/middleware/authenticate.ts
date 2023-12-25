import { Context, Next } from 'koa'
import { ethers } from 'ethers'
import getVerificationMessage from '@/helpers/getVerificationMessage'
import { badRequest } from '@hapi/boom'

export default async function (ctx: Context, next: Next) {
  try {
    const { signature, address } = ctx.headers as {
      signature?: string
      address?: string
    }
    if (!signature || !address) {
      return ctx.throw(
        403,
        'What the hell are you doing here without a signature or address? GO AWAY!'
      )
    }
    ethers.verifyMessage(getVerificationMessage(address), signature)
    ctx.state.address = address
  } catch (err) {
    return ctx.throw(
      badRequest(
        'Ugh oh! Something went wrong with authentication. Nowhere to report though, no one will hear you shouting into the void.'
      )
    )
  }
  return next()
}

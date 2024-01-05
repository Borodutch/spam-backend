import getCasts from '@/helpers/getCasts'
import hashString from '@/helpers/hashString'
import neynar from '@/helpers/neynar'
import signTicket from '@/helpers/signTicket'
import authenticate from '@/middleware/authenticate'
import { CastHashModel } from '@/models/CastHash'
import { TicketModel } from '@/models/Ticket'
import { badRequest, forbidden } from '@hapi/boom'
import { Context, Controller, Ctx, Flow, Get, Params } from 'amala'
import { ethers } from 'ethers'
import { uniqBy } from 'lodash'
import Decimal from 'decimal.js'
import fixTicket from '@/helpers/fixTicket'

@Controller('/tickets')
@Flow(authenticate)
export default class TicketsController {
  @Get('/')
  async tickets(@Ctx() ctx: Context) {
    const address = ctx.state.address as string
    const tickets = await TicketModel.find({ address })
    await Promise.all(tickets.map((t) => fixTicket(t)))
    return TicketModel.find({ address })
  }

  @Get('/generate')
  async generate(@Ctx() ctx: Context) {
    console.log('Generating ticket')
    const address = ctx.state.address as string
    // Find the latest ticket
    const latestTicket = await TicketModel.findOne(
      { address },
      {},
      { sort: { createdAt: -1 } }
    )
    // Check if the latest ticket was created at least a day ago
    if (
      latestTicket?.createdAt &&
      latestTicket?.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24)
    ) {
      return ctx.throw(
        forbidden('You already have a ticket generated in the last 24 hours.')
      )
    }
    // Get user
    const user = await neynar.v1.lookupUserByVerification(address)
    if (!user) {
      return ctx.throw(badRequest('User not found'))
    }
    // Get relevant casts
    const casts = await getCasts(user.fid, latestTicket?.createdAt)
    // Get the casts with $SPAM
    const spamCasts = casts.filter((cast) =>
      cast.text.toLowerCase().includes('$spam')
    )
    // Filter out casts with only $SPAM
    const filteredSpamCasts = spamCasts.filter(
      (cast) => cast.text.replaceAll(/\$spam/gi, '').trim().length > 0
    )
    // Filter out duplicates
    const uniqueSpamCasts = uniqBy(filteredSpamCasts, (cast) => cast.text)
    // Get a map of hashes
    const castsWithHashes = uniqueSpamCasts.map((cast) => ({
      cast,
      hash: hashString(cast.text),
    }))
    // Filter out casts that exist as CastHashes
    const checks = castsWithHashes.map(async (cast) => {
      const found = await CastHashModel.findOne({ castHash: cast.hash })
      return found === null
    })
    const results = await Promise.all(checks)
    const eligibleCastsWithHashes = castsWithHashes.filter(
      (_, index) => results[index]
    )
    // Check if there are any casts eligible
    if (!eligibleCastsWithHashes.length) {
      return ctx.throw(
        forbidden('There are no eligible casts to generate a ticket from.')
      )
    }
    // Save eligible casts as CastHashes
    await CastHashModel.insertMany(
      eligibleCastsWithHashes.map(({ hash: castHash }) => ({
        castHash,
        address,
      }))
    )
    // Calculate the amount
    const amountPerCast = new Decimal(5)
    const likeMultiplier = new Decimal(0.01)
    const recastMultiplier = new Decimal(0.015)
    let baseAmount = new Decimal(0)
    let additionalForLikes = new Decimal(0)
    let additionalForRecasts = new Decimal(0)
    for (const { cast } of eligibleCastsWithHashes) {
      const is21stOfDecember2023 =
        +cast.timestamp >= 1703030400000 && +cast.timestamp <= 1703289600000
      baseAmount = baseAmount
        .add(amountPerCast)
        .add(is21stOfDecember2023 ? amountPerCast : 0)
      const likeBonus = new Decimal(cast.reactions?.count || 0).mul(
        amountPerCast.mul(likeMultiplier)
      )
      additionalForLikes = additionalForLikes.add(likeBonus)
      const recastBonus = new Decimal(cast.recasts?.count || 0).mul(
        amountPerCast.mul(recastMultiplier)
      )
      additionalForRecasts = additionalForRecasts.add(recastBonus)
    }
    // Sign message
    const signature = await signTicket(
      BigInt(address),
      BigInt(0),
      ethers.parseEther(
        `${Number(
          baseAmount
            .add(additionalForLikes)
            .add(additionalForRecasts)
            .toFixed(18)
        )}`
      ),
      BigInt(new Date(casts[casts.length - 1].timestamp).getTime()),
      BigInt(new Date(casts[0].timestamp).getTime())
    )
    // Save ticket
    await TicketModel.create({
      address,
      signature: signature.signature,
      ticketType: 0,
      fromDate: casts[casts.length - 1].timestamp,
      toDate: casts[0].timestamp,
      baseAmount: Number(baseAmount.toFixed(18)),
      additionalForLikes: Number(additionalForLikes.toFixed(18)),
      additionalForRecasts: Number(additionalForRecasts.toFixed(18)),
      total: Number(
        baseAmount.add(additionalForLikes).add(additionalForRecasts).toFixed(18)
      ),
    })
    console.log('Ticket generated:', signature.signature)
    // Return the result
    return {
      baseAmount,
      additionalForLikes,
      additionalForRecasts,
      total: Number(
        baseAmount.add(additionalForLikes).add(additionalForRecasts).toFixed(18)
      ),
      signature,
    }
  }

  @Get('/:signature')
  async ticket(@Params('signature') signature: string) {
    return TicketModel.findOne({ signature })
  }
}

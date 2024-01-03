import contract from '@/helpers/contract'
import neynar from '@/helpers/neynar'
import env from '@/helpers/env'
import { TypedContractEvent } from '@borodutch/spam-contract/dist/typechain/common'
import { ethers } from 'ethers'

function publishCast(message: string) {
  return neynar.v2.publishCast(env.SIGNER_UUID, message, {
    replyTo: 'https://warpcast.com/~/channel/spam',
  })
}

async function handleSpamEvent(
  { name }: TypedContractEvent,
  address: string,
  amount?: bigint
) {
  console.log(`${name} event from ${address}`)
  const user = await neynar.v1.lookupUserByVerification(address)
  let spammer = user?.username ? `@${user.username}` : address

  switch (name) {
    case contract.filters.AteSpam.name:
      return publishCast(`${spammer} ate some $SPAM! 🍽`)
    case contract.filters.PrayedToSpamGod.name:
      return publishCast(`${spammer} prayed to the $SPAM God! 🙏`)
    case contract.filters.ClaimedSpam.name:
      if (!amount) return
      return publishCast(
        `${spammer} claimed ${ethers.formatEther(amount)} $SPAM! 🤑`
      )
    default:
      return
  }
}

export default async function () {
  await contract.on(contract.filters.AteSpam, async (address) => {
    return handleSpamEvent(contract.filters.AteSpam, address)
  })
  await contract.on(contract.filters.PrayedToSpamGod, async (address) => {
    return handleSpamEvent(contract.filters.PrayedToSpamGod, address)
  })
  await contract.on(
    contract.filters.ClaimedSpam,
    async (address, _, amount) => {
      return handleSpamEvent(contract.filters.ClaimedSpam, address, amount)
    }
  )
}

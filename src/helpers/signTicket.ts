import spamGod from '@/helpers/spamGod'
import { ethers } from 'ethers'

function evenPad(value: string) {
  return value.length % 2 === 0 ? value : `0${value}`
}

function turnIntoBytes(value: bigint) {
  return ethers.getBytes(
    ethers.zeroPadValue(`0x${evenPad(value.toString(16))}`, 32)
  )
}

export default async function (
  spammer: bigint,
  ticketType: bigint,
  spamAmount: bigint,
  fromTimestamp: bigint,
  toTimestamp: bigint
) {
  // The data is:
  // uint256 spammer
  // uint256 ticketType
  // uint256 spamAmount
  // uint256 fromTimestamp
  // uint256 toTimestamp
  const spammerBytes = turnIntoBytes(spammer)
  const ticketTypeBytes = turnIntoBytes(ticketType)
  const spamAmountBytes = turnIntoBytes(spamAmount)
  const fromTimestampBytes = turnIntoBytes(fromTimestamp)
  const toTimestampBytes = turnIntoBytes(toTimestamp)
  const message = [
    ...spammerBytes,
    ...ticketTypeBytes,
    ...spamAmountBytes,
    ...fromTimestampBytes,
    ...toTimestampBytes,
  ]
  const signature = await spamGod.signMessage(new Uint8Array(message))
  return {
    message,
    signature,
  }
}

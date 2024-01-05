import { Ticket } from '@/models/Ticket'
import { DocumentType } from '@typegoose/typegoose'
import signTicket from '@/helpers/signTicket'
import { ethers } from 'ethers'

export default async function (ticket: DocumentType<Ticket>) {
  // Sign message
  const signature = await signTicket(
    BigInt(ticket.address),
    BigInt(0),
    ethers.parseEther(`${ticket.total}`),
    BigInt(ticket.fromDate.getTime()),
    BigInt(ticket.toDate.getTime())
  )
  if (ticket.signature === signature.signature) return
  return ticket.updateOne({ signature: signature.signature })
}

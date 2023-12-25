import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class Ticket {
  @prop({ index: true, required: true })
  address!: string
  @prop({ index: true, required: true, unique: true })
  signature!: string
  @prop({ index: true, required: true })
  ticketType!: number
  @prop({ index: true, required: true })
  fromDate!: Date
  @prop({ index: true, required: true })
  toDate!: Date
  @prop({ index: true, required: true })
  baseAmount!: number
  @prop({ index: true, required: true })
  additionalForLikes!: number
  @prop({ index: true, required: true })
  additionalForRecasts!: number
  @prop({ index: true, required: true })
  total!: number

  createdAt!: Date
}

export const TicketModel = getModelForClass(Ticket)

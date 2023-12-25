import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class CastHash {
  @prop({ index: true, required: true })
  address!: string
  @prop({ index: true, required: true })
  castHash!: string
}

export const CastHashModel = getModelForClass(CastHash)

import { createHash } from 'crypto'

export default function hashString(text: string) {
  return createHash('sha256').update(text).digest('hex')
}

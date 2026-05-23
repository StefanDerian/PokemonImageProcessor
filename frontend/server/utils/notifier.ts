import { EventEmitter } from 'node:events'

const emitter = new EventEmitter()
emitter.setMaxListeners(200)

export function getNotifier() {
  return emitter
}

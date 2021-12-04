import Distube from 'distube'
import { client } from '../index'

export function distube() {
   return new Distube(client);
}

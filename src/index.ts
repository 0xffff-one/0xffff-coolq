import axios from 'axios';
import { initialize } from './database';

(async () => {
  const test = await initialize();
  const res = await axios.get('https://0xffff.one/');
})();

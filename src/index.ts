import axios from 'axios';
import * as DataBase from './database';

(async () => {
  const test = await DataBase.initialize();
  const res = await axios.get('https://0xffff.one/');
})();

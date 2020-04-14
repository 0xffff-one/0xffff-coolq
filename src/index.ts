import axios from 'axios';
import { scheduleJob } from 'node-schedule';
import { CQWebSocket } from 'cq-websocket';
import { parse } from 'fast-xml-parser';
import * as DataBase from './database';
import { logger } from './logger';

async function checkNewPosts() {
  logger.info(`fetch new posts`);
  const { data } = await axios.get("https://0xffff.one/atom");
  
  const result = parse(data) as Atom;
  const list = result.feed.entry.slice(0, 10);
  const currentRecord: DBRecord[] = list.map((item, idx) => {
    const { title, id } = item;
    return {
      id: idx,
      title,
      url: id,
      guid: id,
    };
  });
  const newRecord = await DataBase.checkNewItems(currentRecord);
  const changeNum = await DataBase.insertItems(newRecord);
  logger.info(`get ${changeNum} new posts`);

  // send
  if (changeNum > 0) {
    const pendingEntryList = list.filter(entry => newRecord.find(item => item.guid === entry.id));
    sendToGroup(pendingEntryList);
  }
}

async function sendToGroup(entryList: FeedEntry[]) {
  const list = entryList.map((entry, idx) => {
    const { title, id, author: { name } } = entry;
    const url = id.replace('-/', '/');
    const msgTxt = `#${idx}: ${title}\nby: ${name}\n${url}`;
    return msgTxt;
  });
  const msgText = `> 论坛新帖\n${list.join('\n\n')}`
  console.log(msgText);
}

(async () => {
  await DataBase.initialize();
  logger.info('DB initialized');

  logger.info('Initialize schedule job');
  scheduleJob("*/1 * * * *", checkNewPosts);
  checkNewPosts();
})();

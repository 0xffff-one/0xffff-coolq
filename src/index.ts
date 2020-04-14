import axios from "axios";
import { scheduleJob } from "node-schedule";
import { CQWebSocket } from "cq-websocket";
import { parse } from "fast-xml-parser";
import * as DataBase from "./database";
import { logger } from "./logger";
import { config } from "./config";

const { cqhttp } = config;

const bot = new CQWebSocket({
  host: cqhttp.host,
  port: +cqhttp.port,
  qq: cqhttp.qq,
});

function initializeCoolQ() {
  return new Promise((resolve) => {
    bot
      .on("socket.error", logger.error)
      .on("socket.connecting", (wsType: string) => {
        logger.info(`[coolq] [${wsType}] connecting...`);
      })
      .on("socket.connect", (wsType: string, sock: string, attempts: number) => {
        logger.info(`[coolq] [${wsType}] connected... ${attempts} times.`);
      })
      .on("socket.failed", (wsType: string, attempts: number) => {
        logger.error(`[coolq] [${wsType}] connect failed ${attempts} times.`);
      })
      .on("socket.close", (wsType: string, code: number, desc: string) => {
        logger.info(`[coolq] [${wsType}] connect close ${code} ${desc}`);
      })
      .on("ready", () => {
        logger.info("[coolq] coolq ready");
        resolve();
      });
    bot.connect();
  });
}

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
  const newRecord = await DataBase.filterNewItems(currentRecord);
  const changeNum = await DataBase.insertItems(newRecord);
  logger.info(`get ${changeNum} new posts`);

  // send
  if (changeNum > 0) {
    const pendingEntryList = list.filter((entry) =>
      newRecord.find((item) => item.guid === entry.id)
    );
    sendToGroup(pendingEntryList);
  }
}

async function sendToGroup(entryList: FeedEntry[]) {
  logger.info("sending group message");
  const list = entryList.map((entry, idx) => {
    const {
      title,
      id,
      author: { name },
    } = entry;
    const url = id.replace("-/", "/"); // https://0xffff.one/d/123-/12
    const msgTxt = `#${idx}: ${title}\nby: @${name}\n${url}`;
    return msgTxt;
  });
  const msgText = `> 论坛新帖\n${list.join("\n\n")}`;
  bot("send_group_msg", {
    group_id: cqhttp.groupId,
    message: msgText,
  });
}

(async () => {
  logger.info("Init DB");
  await DataBase.initialize();
  logger.info("DB initialized");

  logger.info("Initialize CoolQ");
  await initializeCoolQ();

  logger.info("Initialize schedule job");
  scheduleJob("*/1 * * * *", checkNewPosts);
  checkNewPosts();
})();

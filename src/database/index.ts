import fs from "fs";
import path from "path";
import * as DB from "./db";

export async function initialize() {
  const { cnt }: { cnt: number } = await DB.get(
    "SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='records'"
  );
  if (cnt === 0) {
    await DB.exec(fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8"));
  }
}

/**
 * 检查 DB 中是否有新的条目，计算差集
 * @param itemsList 需要检查的列表
 */
export async function filterNewItems(itemsList: DBRecord[]) {
  const guids = itemsList.map((item) => item.guid);
  const sql = `SELECT *
    FROM records
    WHERE guid in (${"?".repeat(guids.length).split("").join(",")})`;
  const dbItems = await DB.all<DBRecord>(sql, guids);
  const minusItems = itemsList.filter((item) => !dbItems.find(_item => _item.guid === item.guid));
  return minusItems;
}

/**
 * 往 DB 中插入新条目，返回新增行数
 * @param itemsList 需插入的条目
 */
export async function insertItems(itemsList: Omit<DBRecord, "id">[]) {
  const result = await Promise.all(
    itemsList.map((item) => {
      const sql = `INSERT INTO "records" ("title", "url", "guid") VALUES (?, ?, ?)`;
      const { title, url, guid } = item;
      return DB.run(
        sql,
        [title, url, guid],
      );
    })
  );
  return result.reduce((accu, curr) => accu + curr.changes, 0);
}

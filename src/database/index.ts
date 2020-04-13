import * as fs from "fs";
import * as path from "path";
import * as DB from "./db";

export async function initialize() {
  const { cnt }: { cnt: number } = await DB.get(
    "SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='records'"
  );
  if (cnt === 0) {
    await DB.exec(fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8"));
  }
}

export interface DBRecord {
  id: number;
  title: string;
  url: string;
  guid: string;
};

/**
 * 检查是否有新的条目，返回新条目
 * @param itemsList 需要检查的列表
 */
export function checkNewItems(itemsList: Partial<DBRecord>[]) {
  return itemsList;
}

/**
 * 插入新条目
 * @param itemsList 需插入的条目
 */
export function insertItems(itemsList: Partial<DBRecord>[]) {}

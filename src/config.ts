import path from 'path';

export const config = {
  db_path: path.join(__dirname, '../data/database.db'),
  cqhttp: {
    host: process.env.CQHTTP_HOST || "127.0.0.1",
    port: process.env.CQHTTP_PORT || 6700,
    qq: process.env.BOT_QQ || null,
    groupId: process.env.GROUP_ID || 12345678,
  }
};

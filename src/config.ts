import path from 'path';

export const config = {
  dbFilePath: process.env.DB_FILEPATH || path.join(__dirname, '../data/database.db'),
  cqhttp: {
    host: process.env.CQHTTP_HOST || '127.0.0.1',
    port: process.env.CQHTTP_PORT || 6700,
    qq: process.env.BOT_QQ || '',
    groupId: process.env.GROUP_ID || 12345678,
  }
};

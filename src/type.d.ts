interface Atom {
  feed: AtomFeed;
}

interface AtomFeed {
  title: string;
  subtitle: string;
  id: string;
  updated: string; // 更新时间
  entry: FeedEntry[];
}

interface FeedEntry {
  title: string; // 帖子标题
  link: string; // 帖子链接
  id: string; // 帖子 id，一般与链接相同
  updated: string; // 发表时间
  content: string; // 帖子内容
  author: {
    name: string; // 作者名
  };
}

interface DBRecord {
  id: number;
  title: string;
  url: string;
  guid: string;
}

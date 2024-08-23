import { allWritings } from "@/.contentlayer/generated";
import { getReadableDate } from "@/lib/date";
import Link from "next/link";

export default function Home() {
  const processedWritings = allWritings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => {
      return {
        ...post,
        date: getReadableDate(post.date),
      };
    })
    .slice(0, 4);
  return (
    <div className=" w-full">
      <div className="mt-[5%] text-base flex flex-col leading-normal">
        <div className="w-full mb-4 flex items-center justify-between gap-6">
          <div className="avatar">
            <div className="rounded-full w-16 md:w-24">
              <img
                src="/wendaolee.jpeg"
                alt="avatar"
                className="mt-0 mb-0 object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col flex-grow items-start">
            <div className="flex align-middle items-center gap-2">
              <h1 className="text-2xl md:text-3xl mb-0 mt-0">李 问 道</h1>
              <div className="h-full">
                <p className="mt-0 mb-0 text-gray-400 items-center">
                  /li'wən'daʊ/
                </p>
              </div>
            </div>

            <h3 className="text-lg mb-0 mt-0">WendaoLee</h3>
          </div>

        </div>
        <div className="divider"></div>
        <section className="mb-[20px] w-full">
          李问道。随便写写东西的人。
          <br />
          <br />
          “苔痕深院雨，人影小窗灯”——这是我个人对自己目前的人生评价。
          <br />
          <br />
          目前就职于一家AI创业公司，司职技术总监。
          <br />
          <br />
          在本站，文章产出存放在 Writings 中，其他产出存放在 Works 里。
          <br />
          <br />
          其中，<strong>Writings</strong> 里:
          <ul>
            <li>【Blog】标识的多为技术文章</li>
            <li>【Essay】标识的为杂文随笔</li>
            <li>【Novel】标识的为小说</li>
            <li>【Translation】标识的为翻译</li>
          </ul>
          <br />
          这个博客站点还在缓慢更新中。有很多我过去写的东西还没有迁移过来~
          <br />
          想要与我联系可以在下方找到联系方式😉。
          <br />
        </section>
        <div className="divider"></div>
        <section className="mb-0" style={{ width: "80%", display: "flex" }}>
          Wendao Lee, also known as Erika Lee, is a writer and a programmer.
          <br />
          Most of the articles here are Chinese.
          <br />
        </section>
        <div className="divider"></div>
        <section>
          <h2 className="mb-0 mt-0">你可以在这里找到我👏</h2>
          <h4 className="mb-[20px] mt-0">Contact</h4>
          <ul>
            <li>
              Github: <a href="https://github.com/WendaoLee">@Wendaolee</a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:leewendao@outlook.com">leewendao@outlook.com</a>
            </li>
            <li>
              Douban:{" "}
              <a href="https://www.douban.com/people/leewendao">李问道</a>
            </li>
            <li>
              微信公众号: <a href="/page/wechat">水獭日知社</a>
            </li>
          </ul>
        </section>
        <div className=" border-black"></div>
      </div>

      <div className="recent">
        <div
          className="w-full"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h2 style={{ marginBottom: 0 }}>最近更新</h2>
          <h4 style={{ marginTop: 0 }}>Recently Updated</h4>
          <div>
            <ul>
              {processedWritings.map((post) => (
                <li key={post._id}>
                  <Link href={post.slug}>
                    <span>{post.title}</span>
                  </Link>
                  <span>, {post.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

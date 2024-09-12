import WritingsLists from "@/components/WritingsList";

export async function generateMetadata(){
    return {
        title: "文章列表 - 李问道的博客 / Blog of Wendaolee",
        description: "李问道的文章索引列表。 // Here is WendaoLee(or Erika Lee)'s blogs' list.You can find something interesting here.",
        keyword:["李问道","李问道的文章","Wendaolee","Wendaolee's blog","Erika Lee","Erika Lee's blog","Blogs of Wendaolee"],
        authors: ["李问道","Wendao Lee","Erika Lee","Wendaolee"],
        creator: "WendaoLee",
    }
}

export default function WritingsPage(){
    return (
        <div className="mt-5">
            <h2 className="mb-0">本站存放的文章列表</h2>
            <h4 className="mt-0">Wrtings</h4>
            <p>是的，我还有很多文章没搬过来😴</p>
            <WritingsLists></WritingsLists>
        </div>
    )
}
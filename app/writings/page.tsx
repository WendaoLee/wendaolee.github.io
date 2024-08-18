import WritingsLists from "@/components/WritingsList";

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
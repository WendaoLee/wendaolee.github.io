import WritingsLists from "@/components/WritingsList";

export default function WritingsPage(){
    return (
        <div className="mt-5">
            <h2 className="mb-0">我的所有文章</h2>
            <h4 className="mt-0">Wrtings</h4>
            <WritingsLists></WritingsLists>
        </div>
    )
}
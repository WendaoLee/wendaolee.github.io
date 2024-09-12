
export default function NotFound() {
  return (
      <div className="text-sm mt-10 md:text-xl flex h-full flex-col justify-center items-center">
        <h1 className="font-bold text-xl">Ops~ 404 - Page Not Found</h1>
        <p> 完蛋噜，页面找不到了</p>
        <div className="divider"></div>
        <img src="/404-rabbit.webp"></img>
        <div className="divider"></div>
        <p className="my-1">但是不用紧张，你还可以看看这只可爱的小兔子。</p>
        <p className="my-1">这是我画的。👏</p>
        <p className="my-1">如果你觉得它有什么可以修改的地方，</p>
        <p className="my-1">可以在 Home 里找到我的联系方式和我联系。</p>
        <p className="text-gray-500 my-1">记得顺带反馈一下你是在访问什么页面时出现了这个问题哦~。</p>
        <div className="divider"></div>
        <p className="my-1">The page you request is not found.</p>
        <p className="my-1">But~~~Take it easy. Just enjoy this cute little bunny.</p>
        <p className="my-1">I drew it myself.👏</p>
        <p className="my-1">If you want to give me some feedback for it,</p>
        <p className="my-1">you can contact me at <strong>Home</strong> page.</p>
        <p className="text-gray-500 my-1 text-center">It would be great if you could let me know which page you were trying to access when you ran into this issue. </p>
        <p className="my-1">Cheers~</p>
      </div>
  );
}

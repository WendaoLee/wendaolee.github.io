import { ModeToggle } from "./ModeToggle";
import { IntelligentLink } from "./IntelligentLink";
import { Rss } from "lucide-react";

export default function Header(){


  const linkFontClass = "text-sm md:text-xl";
    return (
            <header className="mb-10">
              <div className="flex items-center justify-between ">
                <nav className="mr-auto text-sm font-medium space-x-6">

                  <IntelligentLink className={linkFontClass} href="/">Home</IntelligentLink>
                  <IntelligentLink className={linkFontClass} href="/writings">Writings</IntelligentLink>
                  <IntelligentLink className={linkFontClass} href="/works">Works</IntelligentLink>
                  {/* <IntelligentLInk className={linkFontClass} href="/about"></Link> */}
                </nav>
                <div className="flex justify-between gap-3">
                  <a href="/rss.xml">
                    <Rss/>
                  </a>
                  <ModeToggle />
                </div>
              </div>
            </header>
    )
}
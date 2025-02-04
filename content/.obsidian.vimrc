" Have j and k navigate visual lines rather than logical ones
nmap j gj
nmap k gk
" I like using H and L for beginning/end of line
nmap H ^
nmap L $
" Quickly remove search highlights
nmap <F9> :nohl

" Go back and forward with Ctrl+O and Ctrl+I
" (make sure to remove default Obsidian shortcuts for these to work)
exmap back obcommand app:go-back
nmap <C-o> :back
exmap forward obcommand app:go-forward
" nmap <C-i> :forward

exmap vs obcommand workspace:split-vertical
exmap hs obcommand workspace:split-horizontal
exmap bn obcommand workspace:next-tab
exmap bp obcommand workspace:previous-tab
exmap bc obcommand workspace:close
exmap e obcommand file-explorer:new-file

" 打开新 tab
exmap on obcommand workspace:new-tab 
" 重启
exmap reload obcommand app:reload

" 展开
exmap fold obcommand editor:fold-more
exmap folda obcommand editor:fold-all
" 请注意，使用了 fd 作为 fold 的缩写
exmap fd obcommand editor:fold-more
exmap fda obcommand editor:fold-all

exmap unfold obcommand editor:fold-less
exmap uf obcommand editor:fold-less
exmap ufa obcommand editor:unfold-all

" 打开外部终端
exmap wt obcommand terminal:open-terminal.external.root

" 前往该链接地址
exmap gd obcommand editor:follow-link
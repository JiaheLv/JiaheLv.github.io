// Service Worker (moved to site root): intercept navigation to .md and respond with an HTML page
// that contains the raw markdown; the page will render it client-side using marked + DOMPurify + github-markdown-css.

self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { self.clients.claim(); });

self.addEventListener('fetch', event => {
    const req = event.request;

    // Bypass fetches that explicitly carry this header (to avoid recursion)
    if (req.headers.get('x-sw-bypass')) return;

    // Only intercept navigation/document requests for .md files
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        const url = new URL(req.url);
        if (url.pathname.endsWith('.md')) {
            event.respondWith((async () => {
                try {
                    // Fetch the raw markdown from network, add bypass header so SW won't re-intercept
                    const mdResp = await fetch(url.href, { headers: { 'x-sw-bypass': '1' } });
                    if (!mdResp.ok) return new Response('Not found', { status: 404 });
                    const mdText = await mdResp.text();

                    // Safely embed markdown as a JS string literal using JSON.stringify
                    const mdLiteral = JSON.stringify(mdText);

                    // Compute a decoded, human-friendly title from the URL filename
                    const rawName = url.pathname.split('/').pop() || '';
                    const decodedName = decodeURIComponent(rawName);
                    const titlePlain = decodedName.replace(/\.md$/i, '');
                    // simple HTML-escape for embedding into <title>
                    const escapeHTML = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    const titleEscaped = escapeHTML(titlePlain);

                    const html = `<!doctype html>
                        <html lang="zh-CN">
                        <head>
                            <meta charset="utf-8" />
                            <meta name="viewport" content="width=device-width,initial-scale=1" />
                            <link rel="icon" href="/image/icon.jpg">
                            <title>${titleEscaped}</title>
                            <script>
                                // 动态探测合适的 github-markdown.css 路径（兼容 user page 与 project page）
                                (function() {
                                    // 优先使用站点中实际路径；把 /css/github-markdown.css 放在首位
                                    const cssPaths = [
                                        '/css/github-markdown.css',
                                        '/github-markdown.css',
                                        './github-markdown.css',
                                        '../github-markdown.css',
                                        '../../github-markdown.css'
                                    ];

                                    const maxAttempts = cssPaths.length;

                                    function attemptLoad(index) {
                                        if (index >= maxAttempts) {
                                            console.log('无法加载 github-markdown.css，使用内置样式');
                                            window.__md_css_loaded = false;
                                            return;
                                        }
                                        const link = document.createElement('link');
                                        link.rel = 'stylesheet';
                                        link.href = cssPaths[index];
                                        link.onload = () => { window.__md_css_loaded = true; };
                                        link.onerror = () => { attemptLoad(index + 1); };
                                        document.head.appendChild(link);
                                    }
                                    attemptLoad(0);
                                    setTimeout(() => {
                                        if (!window.__md_css_loaded) {
                                            console.log('github-markdown.css 加载失败，使用默认样式');
                                            window.__md_css_loaded = true;
                                        }
                                    }, 5000);
                                })();
                                // 注意：不在 head 中执行 markdown 渲染或重新声明 md
                                // 避免与 body 中的脚本重复声明变量并在 marked 加载前执行。
                            </script>
                            <style>
                                /* 保留布局样式，但不要覆盖主题的颜色/背景 */
                                body{ padding:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; }
                                .markdown-body{ box-sizing:border-box; margin:0 auto; max-width:980px; padding:45px; border-radius:6px; }
                                @media(max-width:600px){ .markdown-body{ padding:20px } }
                            </style>
                        </head>
                        <body>
                            <article id="content" class="markdown-body">正在渲染…</article>
                            <script src="/js/marked.min.js"></script>
                            <script src="/js/purify.min.js"></script>
                            <script>
                                // markdown text embedded from SW
                                const md = ${mdLiteral};
                                const html = marked.parse(md);
                                const clean = DOMPurify.sanitize(html, {USE_PROFILES: {html: true}});
                                document.getElementById('content').innerHTML = clean;
                                // set document.title to decoded filename (plain text)
                                try { document.title = ${JSON.stringify(titlePlain)}; } catch(e){}
                                // convert relative links/images to absolute based on the original .md location
                                (function(){
                                    try {
                                        const base = new URL('${url.href}');
                                        document.getElementById('content').querySelectorAll('a').forEach(a=>{
                                            const href = a.getAttribute('href'); if(!href) return;
                                            try{ const u = new URL(href, base);
                                                if(u.pathname.endsWith('.md')) { a.setAttribute('href', u.href); }
                                                else { a.setAttribute('href', u.href); a.setAttribute('target','_blank'); }
                                            }catch(e){}
                                        });
                                        document.getElementById('content').querySelectorAll('img').forEach(img=>{
                                            const src = img.getAttribute('src'); if(!src) return; try{ img.src = new URL(src, base).href;}catch(e){}
                                        });
                                    } catch(e){}
                                })();
                            </script>
                        </body>
                        </html>`;
                    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                } catch (err) {
                    return new Response('Error: ' + err.message, { status: 500 });
                }
            })());
        }
    }
});

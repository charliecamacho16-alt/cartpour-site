# Copies the CartPour app page into app/index.html and makes it an installable, offline web app.
# Run it whenever bar-cart.html changes:  python update-app.py <path to bar-cart.html>
# The app repo's file stays untouched; only this copy gets the manifest link and the service worker.
import hashlib, re, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else '../extracted/bar-cart/bar-cart.html')
here = Path(__file__).parent
html = src.read_text(encoding='utf-8')
assert html.count('</head>') == 1, 'expected one </head>'
head = ('<meta name="description" content="Tick the bottles you own and see every cocktail you can pour tonight. 600+ recipes and 100 mocktails, free and offline.">\n'
        '<link rel="canonical" href="https://cartpour.com/app/">\n<meta property="og:title" content="CartPour – cocktails from your shelf">\n'
        '<meta property="og:image" content="https://cartpour.com/img/og.jpg">\n<meta name="twitter:card" content="summary_large_image">\n'
        '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        "<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))</script>\n"
        # cookie-free page counts (GoatCounter); the Android app never loads this copy, so it stays untracked
        '<script data-goatcounter="https://cart-pour.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n')
html = html.replace('</head>', head + '</head>')
(here / 'app' / 'index.html').write_text(html, encoding='utf-8')
# a new cache name per page version, so a returning visitor gets the update on their next visit
ver = hashlib.sha256(html.encode()).hexdigest()[:10]
sw = here / 'app' / 'sw.js'
sw.write_text(re.sub(r"const V='[^']*'", f"const V='cartpour-{ver}'", sw.read_text(encoding='utf-8')), encoding='utf-8')
print('app/index.html', len(html) // 1024, 'KB; cache', ver)

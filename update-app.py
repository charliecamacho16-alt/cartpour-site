# Copies the CartPour app page into app/index.html and makes it an installable, offline web app.
# Run it whenever bar-cart.html changes:  python update-app.py <path to bar-cart.html>
# The app repo's file stays untouched; only this copy gets the manifest link and the service worker.
import base64, hashlib, re, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else '../extracted/bar-cart/bar-cart.html')
here = Path(__file__).parent
html = src.read_text(encoding='utf-8')
assert html.count('</head>') == 1, 'expected one </head>'
head = ('<meta name="description" content="Select the bottles you own and see every cocktail you can make tonight. 600+ recipes and 100 mocktails, free and offline.">\n'
        '<link rel="canonical" href="https://cartpour.com/app/">\n<meta property="og:title" content="CartPour – cocktails from your shelf">\n'
        '<meta property="og:image" content="https://cartpour.com/img/og.jpg">\n<meta name="twitter:card" content="summary_large_image">\n'
        '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        "<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))</script>\n"
        # cookie-free page counts (GoatCounter); the Android app never loads this copy, so it stays untracked
        '<script data-goatcounter="https://cart-pour.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n')
html = html.replace('</head>', head + '</head>')
# Content Security Policy, first in <head> so it covers every script. Inline scripts are allowed by hash,
# recomputed on every run; a new inline script fails here instead of being silently blocked in the browser.
inline = re.findall(r'<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>', html, re.S)
assert len(inline) == 4, f'expected 4 inline scripts, found {len(inline)}: add the new one on purpose'
hashes = ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'" for s in inline)
csp = ("default-src 'self'; script-src 'self' " + hashes + " https://gc.zgo.at; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data: https://cart-pour.goatcounter.com; connect-src 'self' https://cart-pour.goatcounter.com; "
       "font-src 'self' data:; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'")
assert html.count('<meta charset="utf-8">') == 1, 'expected one charset meta'
html = html.replace('<meta charset="utf-8">', f'<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="{csp}">')
(here / 'app' / 'index.html').write_bytes(html.encode('utf-8'))  # bytes: Windows newline translation would break the hashes
# a new cache name per page version, so a returning visitor gets the update on their next visit
ver = hashlib.sha256(html.encode()).hexdigest()[:10]
sw = here / 'app' / 'sw.js'
sw.write_text(re.sub(r"const V='[^']*'", f"const V='cartpour-{ver}'", sw.read_text(encoding='utf-8')), encoding='utf-8')
print('app/index.html', len(html) // 1024, 'KB; cache', ver)

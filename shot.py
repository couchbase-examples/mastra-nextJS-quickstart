import sys, json
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
init = """
(() => { window.__getDoc = [];
  const orig = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function(msg, ...rest) {
    try { if (msg && msg.action === 'GetDocRequest') window.__getDoc.push(msg.data.evaluatorOptions); } catch (e) {}
    return orig.call(this, msg, ...rest);
  };
})();
"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1400, "height": 1000})
    pg.add_init_script(init)
    pg.goto(url, wait_until="networkidle")
    pg.wait_for_selector(".rpv-core__text-layer-text, .rpv-core__canvas-layer canvas", timeout=30000)
    pg.wait_for_timeout(1500)
    opts = pg.evaluate("window.__getDoc")
    pg.screenshot(path=out + ".png")
    json.dump(opts, open(out + ".json", "w"), indent=1)
    print(json.dumps([{k: o.get(k) for k in ("isEvalSupported",)} for o in opts]))
    b.close()

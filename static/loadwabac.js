class WabacLiveProxy
{
  constructor(prefix, url, ts) {
    this.prefix = prefix;
    this.url = url;
    this.ts = ts;
    this.collName = new URL(prefix, "http://dummy").pathname.split('/')[1];
    this.matchRx = new RegExp(`${this.collName}\\/([\\d]+)?\\w\\w_\\/(.*)`);
    this.adblockUrl = undefined;

    this.queryParams = {};
  }

  async init() {
    const scope = '/';

    await navigator.serviceWorker.register("/static/sw.js?" + new URLSearchParams(this.queryParams).toString(), {scope});

    let initedResolve = null;

    const inited = new Promise((resolve) => initedResolve = resolve);

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.msg_type === "collAdded") {
        // the replay is ready to be loaded when this message is received
        initedResolve();
      }
    });

    const baseUrl = new URL(window.location);
    baseUrl.hash = "";

    const proxyPrefix = "";

    const msg = {
      msg_type: "addColl",
      name: this.collName,
      type: "live",
      file: {"sourceUrl": `proxy:${proxyPrefix}`},
      skipExisting: false,
      extraConfig: {
        prefix: proxyPrefix,
        isLive: false,
        baseUrl: baseUrl.href,
        baseUrlHashReplay: true,
        noPostToGet: true,
        archivePrefix: `/${this.collName}/`,
        adblockUrl: this.adblockUrl
      },
    };

    if (!navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        navigator.serviceWorker.controller.postMessage(msg);
      });
    } else {
      navigator.serviceWorker.controller.postMessage(msg);
    }

    window.addEventListener('message', event => {
      let data = event.data;
      if (data.wb_type !== 'load') return;
      history.replaceState({}, data.title, this.prefix + data.ts + '/' + data.url)
      window.WBBanner.onMessage(event);
    });

    if (inited) {
      await inited;
    }

    const iframe = document.querySelector("#replay_iframe");
    iframe.src = `/w/${this.collName}/${this.ts}mp_/${this.url}`;
  }
}

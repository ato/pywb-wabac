pywb+wabac
==========

This is a proof of concept config integrating [pywb](https://github.com/webrecorder/pywb) with the serviceworker-based HTML rewriting from [wabac.js](https://github.com/webrecorder/wabac.js) (part of [ReplayWeb.page](https://github.com/webrecorder/replayweb.page)). It mostly works including the pywb banner but it hasn't been tested much and there's probably some rough edges.


Usage
-----

From the root directory of this repo:

1. Install pywb: `pip install pywb`
2. Add a collection: `wb-manager init test`
3. Add some WARCs to the collection: `wb-manager add test mywarc.warc.gz`
4. Run it: `./go.py --port 8080`

How this works
--------------

We override [template/frame_insert.html](template/frame_insert.html) to use [static/loadwabac.js](static/loadwabac.js)
instead of pywb's normal wb_frame.js. This registers the wabac.js serviceworker (static/sw.js).

wabac.js is configured in live proxy mode to load resources from pywb using the `id_` modifier.

The serviceworker sw.js needs to have a `Service-Worker-Allowed: /` response header set or the browser will
only allow scoping it to the /static/ directory. So we subclass
pywb's FrontEndApp in [go.py](go.py) to add this header. If you can add this header some other way
(e.g. nginx rule) you can use pywb unmodified.

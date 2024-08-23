from pywb.apps.cli import ReplayCli
from pywb.apps.frontendapp import FrontEndApp
from werkzeug.routing import Rule


class MyApp(FrontEndApp):
    def __init__(self, custom_config):
        super().__init__(custom_config)
        self.url_map.add(Rule('/static/sw.js', endpoint=self.serve_sw))

    def serve_sw(self, environ, coll=''):
        response = super().serve_static(environ, coll, 'sw.js')
        response.status_headers['Service-Worker-Allowed'] = '/'
        return response


class MyCli(ReplayCli):
    def load(self):
        super(MyCli, self).load()
        return MyApp(custom_config=self.extra_config)


if __name__ == "__main__":
    MyCli().run()

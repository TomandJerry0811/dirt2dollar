import http.server
import urllib.request
import urllib.error
import socketserver
import os

PORT = 3000
BACKEND_URL = "http://localhost:8001"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="dist", **kwargs)

    def do_proxy(self):
        url = BACKEND_URL + self.path
        req = urllib.request.Request(url, method=self.command)
        for key, value in self.headers.items():
            if key.lower() not in ['host']:
                req.add_header(key, value)
        
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            req.data = self.rfile.read(content_length)

        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for key, value in response.headers.items():
                    self.send_header(key, value)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, value in e.headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_GET(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            path = self.translate_path(self.path)
            if not os.path.exists(path):
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            super().do_POST()

    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            super().do_PUT()

    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            super().do_DELETE()

    def do_OPTIONS(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            super().do_OPTIONS()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

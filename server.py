from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request, json

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            length = int(self.headers['Content-Length'])
            body = self.rfile.read(length)
            
            req = urllib.request.Request(
                'https://api.anthropic.com/v1/messages',
                data=body,
                headers={
                    'Content-Type': 'application/json',
                    'x-api-key': 'YOUR_API_KEY_HERE',  # 👈 idha maattu
                    'anthropic-version': '2023-06-01'
                }
            )
            resp = urllib.request.urlopen(req)
            result = resp.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(result)

print("✦ Aura Events server running → http://localhost:8000")
HTTPServer(('', 8000), Handler).serve_forever()
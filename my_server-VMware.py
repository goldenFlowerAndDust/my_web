from http.server import HTTPServer, CGIHTTPRequestHandler

class SmartHandler(CGIHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?')[0]
        # 打印路径到控制台，帮助调试
        print(f"Requested path: '{path}'")
        if path == '' or path == '/' or path.endswith('/'):
            content_type = 'text/html; charset=utf-8'
        elif path.endswith('.html') or path.endswith('.htm'):
            content_type = 'text/html; charset=utf-8'
        elif path.endswith('.py'):
            content_type = 'text/plain; charset=utf-8'
        elif path.endswith('.css'):
            content_type = 'text/css; charset=utf-8'
        elif path.endswith('.js'):
            content_type = 'application/javascript; charset=utf-8'
        else:
            content_type = 'text/plain; charset=utf-8'
        self.send_header('Content-Type', content_type)
        super().end_headers()

server = HTTPServer(('0.0.0.0', 8000), SmartHandler)
print("服务器已启动：http://localhost:8000")
print("按 Ctrl+C 停止服务器")
server.serve_forever()
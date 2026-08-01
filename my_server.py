from http.server import HTTPServer, CGIHTTPRequestHandler
import mimetypes

class SmartHandler(CGIHTTPRequestHandler):
    def end_headers(self):
        # 去掉查询参数（如 ?v=1.0）
        path = self.path.split('?')[0]

        # 如果是根目录，强制返回 HTML（目录列表）
        if path == '' or path == '/':
            content_type = 'text/html; charset=utf-8'
        else:
            # 根据文件扩展名自动获取 Content-Type
            content_type, _ = mimetypes.guess_type(path)
            if not content_type:
                # 如果无法识别，默认按纯文本处理
                content_type = 'text/plain'
            # 对文本类文件强制指定 UTF-8 字符集
            if content_type.startswith('text/'):
                content_type += '; charset=utf-8'

        self.send_header('Content-Type', content_type)
        super().end_headers()

# 启动服务器，监听所有 IP（0.0.0.0）和端口 8000
server = HTTPServer(('0.0.0.0', 8000), SmartHandler)
print("服务器已启动：http://localhost:8000")
print("手机或局域网访问：http://你的IP:8000")
server.serve_forever()
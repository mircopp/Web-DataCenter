from flask import Flask, Response
import ssl
import sys
import os
from PIL import Image

app = Flask(__name__)

@app.route('/')
def index():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'index.html'))
    return Response(open(abs_path).read(), mimetype='text/html')

@app.route('/api')
def api():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'api.html'))
    return Response(open(abs_path).read(), mimetype='text/html')

@app.route('/<path:path>')
def main_file(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), path))
    return Response(open(abs_path, 'rb').read())

@app.route('/scripts/<path:path>')
def main_js(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts', path))
    return Response(open(abs_path).read(), mimetype='application/javascript')

@app.route('/scripts/lib/<path:path>')
def lib_js(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts', 'lib', path))
    return Response(open(abs_path, encoding='utf8').read(), mimetype='application/javascript')

@app.route('/scripts/test/<path:path>')
def test_js(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts', 'test', path))
    return Response(open(abs_path, encoding='utf8').read(), mimetype='application/javascript')

@app.route('/scripts/custom/<path:path>')
def custom_js(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts', 'custom', path))
    return Response(open(abs_path, encoding='utf8').read(), mimetype='application/javascript')

@app.route('/styles/<path:path>')
def main_css(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'styles', path))
    return Response(open(abs_path).read(), mimetype='text/css')

@app.route('/images/<path:path>')
def main_img(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'images', path))
    return Response(open(abs_path, 'rb').read())

@app.route('/images/touch/<path:path>')
def touch_img(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'images', 'touch', path))
    return Response(open(abs_path, 'rb').read(), mimetype='image/png')

@app.route('/images/icons/<path:path>')
def icon_img(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'images', 'icons', path))
    return Response(open(abs_path, 'rb').read(), mimetype='image/png')

@app.route('/service-worker.js')
def service_worker():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'service-worker.js'))
    return Response(open(abs_path).read(), mimetype='application/javascript')

@app.route('/config.js')
def config():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.js'))
    return Response(open(abs_path).read(), mimetype='application/javascript')

@app.route('/config_api.js')
def config_api():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config_api.js'))
    return Response(open(abs_path).read(), mimetype='application/javascript')


@app.route('/manifest.json')
def manifest():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'manifest.json'))
    return Response(open(abs_path).read(), mimetype='application/json')

@app.route('/icon.png')
def icon():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'icon.png'))
    return Response(open(abs_path, 'rb').read(), mimetype='application/json')



if __name__ == '__main__':
    temp = os.path.abspath(os.path.join(os.path.dirname(__file__),os.path.pardir))
    path = os.path.abspath(os.path.join(temp, os.path.pardir))
    context = (path  + '/ressources/ssl_certificates/app_client.crt', path + '/ressources/ssl_certificates/app_client.key')
    app.run(host='0.0.0.0', port=3000, ssl_context=context, threaded=True, debug=True)

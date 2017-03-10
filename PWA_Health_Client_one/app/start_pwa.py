from flask import Flask, Response
from flask_cors import CORS
import ssl
import sys
import os

app = Flask(__name__)
cors = CORS(app)

@app.route('/')
def index():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'index.html'))
    return Response(open(abs_path).read(), mimetype='text/html')

@app.route('/<path:path>')
def main_file(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), path))
    return Response(open(abs_path).read())

@app.route('/scripts/<path:path>')
def main_js(path):
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts', path))
    return Response(open(abs_path).read(), mimetype='application/javascript')

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

@app.route('/service-worker.js')
def service_worker():
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'service-worker.js'))
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
    app.run(host='0.0.0.0', port=5000, ssl_context=context, threaded=True, debug=True)

from flask import Flask, request, jsonify, send_file
import json
import yaml
import os
import tempfile

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/convert', methods=['POST'])
def convert_json_to_yaml():
    # Verifică dacă există un fișier JSON în cererea utilizatorului
    if 'file' not in request.files:
        return jsonify({'error': 'A file must be provided'}), 400

    json_file = request.files['file']

    # Verifică dacă fișierul are extensia .json
    if not json_file.filename.endswith('.json'):
        return jsonify({'error': 'The file must be a JSON file'}), 400

    try:
        # Citește conținutul fișierului JSON și îl încarcă
        json_data = json.load(json_file)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # Convertește JSON-ul în YAML
    yaml_data = yaml.dump(json_data, default_flow_style=False)

    # Scrie informațiile YAML într-un fișier temporar
    temp_dir = tempfile.gettempdir()
    yaml_file_path = os.path.join(temp_dir, os.path.splitext(json_file.filename)[0] + '.yaml')

    with open(yaml_file_path, 'w') as f:
        f.write(yaml_data)

    # Returnează fișierul YAML utilizatorului
    return jsonify({
        'file': f'/download/{os.path.basename(yaml_file_path)}'
    })

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)

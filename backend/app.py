from flask import Flask, jsonify
from flask_cors import CORS
from routes.groups import bp as groups_bp

app = Flask(__name__)
CORS(app)

#Register blueprints
app.register_blueprint(
    groups_bp,
    url_prefix="/api/groups"
)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "success",
        "message": "Flask server is running successfully!"
    })

if __name__ == "__main__":
    # Chạy trên port 5000, bật debug để tự restart khi sửa code
    app.run(port=5000,debug=True)
from flask import request, jsonify, Blueprint
from services.group_service import get_groups, create_group, get_group_by_id

bp = Blueprint('groups', __name__)

@bp.get("/")
def list_groups():
    filters = request.args.to_dict()
    groups = get_groups(filters)
    return jsonify(groups)

@bp.post("/")
def create():
    data = request.get_json()
    group = create_group(data)
    return jsonify(group), 201

@bp.get("/<int:group_id>")
def detail(group_id):
    group = get_group_by_id(group_id)
    return jsonify(group)
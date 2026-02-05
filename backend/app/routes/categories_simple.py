from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_categories():
    print("GET /api/categories called (simple router)")
    return [{"id": 1, "name": "Web Development", "description": "Web dev content", "color": "#3B82F6"}]

@router.post("/")
def create_category(data: dict):
    print(f"POST /api/categories called (simple router): {data}")
    return {"id": 999, "name": data.get("name", "New Category"), "description": data.get("description", ""), "color": data.get("color", "#3B82F6")}

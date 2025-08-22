from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from utils.logger import logger
from services.supabase import DBConnection
from pydantic import BaseModel

router = APIRouter()

class Department(BaseModel):
    id: str
    name: str
    display_order: int
    is_active: bool

@router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all active departments ordered by display_order"""
    try:
        db = DBConnection()
        await db.initialize()
        supabase = await db.client
        
        response = await supabase.table("departments")\
            .select("id, name, display_order, is_active")\
            .eq("is_active", True)\
            .order("display_order")\
            .execute()
        
        if not response.data:
            logger.warning("No departments found")
            return []
        
        departments = [
            Department(
                id=dept["id"],
                name=dept["name"],
                display_order=dept["display_order"],
                is_active=dept["is_active"]
            )
            for dept in response.data
        ]
        
        return departments
        
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/departments/names")
async def get_department_names():
    """Get department names only for dropdowns"""
    try:
        db = DBConnection()
        await db.initialize()
        supabase = await db.client
        
        response = await supabase.table("departments")\
            .select("name")\
            .eq("is_active", True)\
            .order("display_order")\
            .execute()
        
        if not response.data:
            return []
        
        return [dept["name"] for dept in response.data]
        
    except Exception as e:
        logger.error(f"Error fetching department names: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
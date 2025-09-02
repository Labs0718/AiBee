"""
Groupware API for managing groupware authentication
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from services.supabase import DBConnection
from utils.auth_utils import get_current_user_id_from_jwt, verify_admin_api_key
from utils.logger import structlog

router = APIRouter()

class StorePasswordRequest(BaseModel):
    password: str

class StorePasswordAdminRequest(BaseModel):
    user_id: str
    password: str

class PasswordResponse(BaseModel):
    password: str

@router.post("/store-password")
async def store_groupware_password(
    request: StorePasswordRequest,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """
    Store groupware password in user_info.password_start for the current user
    """
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Update password_start in user_info table
        result = await client.table('user_info').upsert({
            'id': user_id,
            'password_start': request.password,
            'updated_at': 'now()'
        }, on_conflict='id').execute()
        
        if result.data:
            structlog.get_logger().info(f"Successfully stored groupware password for user {user_id}")
            return {"message": "Groupware password stored successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to store groupware password")
            
    except Exception as e:
        structlog.get_logger().error(f"Error storing groupware password: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/store-password-admin")
async def store_groupware_password_admin(
    request: StorePasswordAdminRequest,
    admin_verified: bool = Depends(verify_admin_api_key)
):
    """
    Store groupware password in user_info.password_start for a specific user (admin only)
    """
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Update password_start in user_info table
        result = await client.table('user_info').upsert({
            'id': request.user_id,
            'password_start': request.password,
            'updated_at': 'now()'
        }, on_conflict='id').execute()
        
        if result.data:
            structlog.get_logger().info(f"Admin stored groupware password for user {request.user_id}")
            return {"message": "Groupware password stored successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to store groupware password")
            
    except Exception as e:
        structlog.get_logger().error(f"Error storing groupware password (admin): {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/password", response_model=PasswordResponse)
async def get_groupware_password(
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """
    Get groupware password from user_info.password_start for the current user
    """
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Get password_start from user_info table
        result = await client.table('user_info').select('password_start').eq('id', user_id).single().execute()
        
        if result.data and result.data.get('password_start'):
            password = result.data['password_start']
            return PasswordResponse(password=password)
        else:
            raise HTTPException(status_code=404, detail="Groupware password not found")
            
    except HTTPException:
        raise
    except Exception as e:
        structlog.get_logger().error(f"Error retrieving groupware password: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
"""
Groupware API for managing groupware authentication
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from services.groupware_auth import GroupwareAuthService
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
    Store encrypted groupware password for the current user
    """
    try:
        groupware_service = GroupwareAuthService()
        success = await groupware_service.store_groupware_password(user_id, request.password)
        
        if success:
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
    Store encrypted groupware password for a specific user (admin only)
    """
    try:
        groupware_service = GroupwareAuthService()
        success = await groupware_service.store_groupware_password(request.user_id, request.password)
        
        if success:
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
    Get decrypted groupware password for the current user
    """
    try:
        groupware_service = GroupwareAuthService()
        password = await groupware_service.get_groupware_password(user_id)
        
        if password:
            return PasswordResponse(password=password)
        else:
            raise HTTPException(status_code=404, detail="Groupware password not found")
            
    except HTTPException:
        raise
    except Exception as e:
        structlog.get_logger().error(f"Error retrieving groupware password: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
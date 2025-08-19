"""
API endpoints for account deletion functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from services.account_deletion import AccountDeletionService, AccountDeletionRequest
from services.supabase import DBConnection
from utils.auth_utils import get_current_user_id_from_jwt
from utils.logger import structlog

router = APIRouter(prefix="/account", tags=["account-deletion"])

async def get_deletion_service():
    """Dependency to get account deletion service"""
    db = DBConnection()
    await db.initialize()
    return AccountDeletionService(db)

@router.get("/deletion-preview")
async def get_account_deletion_preview(
    user_id: str = Depends(get_current_user_id_from_jwt),
    service: AccountDeletionService = Depends(get_deletion_service)
):
    """
    Get a preview of what will be deleted when the account is permanently removed.
    This endpoint shows the user what data will be lost.
    """
    try:
        preview = await service.get_account_deletion_preview(user_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=preview
        )
    except Exception as e:
        structlog.get_logger().error("Account deletion preview failed", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate deletion preview"
        )

@router.post("/delete-permanently")
async def delete_account_permanently(
    request: AccountDeletionRequest,
    user_id: str = Depends(get_current_user_id_from_jwt),
    service: AccountDeletionService = Depends(get_deletion_service)
):
    """
    Permanently delete the user's account and all associated data.
    
    This operation is irreversible and will:
    - Delete all conversations, messages, and agent runs
    - Delete all custom agents and configurations  
    - Delete all projects and recordings
    - Delete all API keys and device information
    - Delete the user's account and authentication credentials
    
    Requires:
    - Current password for verification
    - Confirmation text "DELETE" to prevent accidental deletion
    """
    try:
        result = await service.delete_account_permanently(user_id, request)
        
        # Log the successful deletion for audit purposes
        structlog.get_logger().info(
            "Account deletion completed successfully",
            user_id=user_id,
            deletion_summary=result.get("deletion_summary", {})
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        structlog.get_logger().error(
            "Account deletion failed with unexpected error", 
            error=str(e), 
            user_id=user_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion failed due to an unexpected error"
        )
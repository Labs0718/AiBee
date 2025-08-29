"""
API endpoints for user profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from services.supabase import DBConnection
from utils.auth_utils import get_current_user_id_from_jwt
import jwt
from fastapi import Request
import structlog
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/user", tags=["user-profile"])

class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    name: Optional[str] = None
    department_name: Optional[str] = None
    role: str = 'user'  # 'admin', 'operator', 'user'
    created_at: str

async def get_db():
    """Dependency to get database connection"""
    db = DBConnection()
    await db.initialize()
    return db

def get_user_info_from_jwt(request: Request):
    """Extract user info from JWT token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, None
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get('sub')
        email = payload.get('email')
        return user_id, email
    except:
        return None, None

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    request: Request,
    user_id: str = Depends(get_current_user_id_from_jwt),
    db: DBConnection = Depends(get_db)
):
    """
    Get current user's profile information
    """
    try:
        # Get email from JWT token
        _, email = get_user_info_from_jwt(request)
        
        client = await db.client
        
        # Get user account from basejump.accounts
        account_result = await client.schema('basejump').from_('accounts').select('*').eq('primary_owner_user_id', user_id).execute()
        account_data = account_result.data[0] if account_result.data else None
        print(f"🔍 DEBUG: Account data retrieved for user {user_id}: {account_data}")
        
        # Get user profile data from user_profiles table
        profile_result = await client.from_('user_profiles').select('name, department_id').eq('id', user_id).execute()
        profile_data = profile_result.data[0] if profile_result.data else None
        print(f"🔍 DEBUG: Profile data retrieved for user {user_id}: {profile_data}")
        
        if not account_data and not profile_data:
            raise HTTPException(
                status_code=404,
                detail="User account not found"
            )
        
        # Get user email and metadata from auth.users table
        user_email = None
        auth_user_data = None
        try:
            auth_user_result = await client.schema('auth').table('users').select('email, raw_user_meta_data').eq('id', user_id).execute()
            if auth_user_result.data:
                auth_user_data = auth_user_result.data[0]
                user_email = auth_user_data.get('email')
                structlog.get_logger().info("Auth user data retrieved", auth_user_data=auth_user_data, user_id=user_id)
        except Exception as e:
            # Fallback to JWT email if available
            user_email = email
        
        # Get department name from department_id if it exists (prioritize user_profiles data)
        department_name = None
        department_id = profile_data.get('department_id') if profile_data else account_data.get('department_id') if account_data else None
        
        if department_id:
            try:
                dept_result = await client.from_('departments').select('name').eq('id', department_id).execute()
                if dept_result.data:
                    department_name = dept_result.data[0].get('name')
            except Exception as e:
                # Department lookup failed, continue without department name
                pass
        
        # Get real name from various sources
        # Priority: 1. user_profiles.name 2. auth.users.raw_user_meta_data.display_name 3. basejump.accounts.display_name 4. email prefix
        real_name = None
        if profile_data and profile_data.get('name'):
            real_name = profile_data.get('name')
        elif auth_user_data and auth_user_data.get('raw_user_meta_data') and auth_user_data.get('raw_user_meta_data').get('display_name'):
            real_name = auth_user_data.get('raw_user_meta_data').get('display_name')
        elif account_data and account_data.get('display_name'):
            real_name = account_data.get('display_name')
        elif account_data and account_data.get('name'):
            real_name = account_data.get('name')
        
        # If no real name found, extract from email prefix
        if not real_name and user_email:
            real_name = user_email.split('@')[0]
        
        display_name = real_name
        
        result_data = {
            'id': user_id,
            'email': user_email or email or 'unknown@example.com',
            'display_name': display_name,
            'name': real_name,
            'department_name': department_name,
            'created_at': account_data.get('created_at', datetime.now().isoformat()) if account_data else datetime.now().isoformat(),
            'role': account_data.get('role', 'user') if account_data else 'user'
        }
        
        profile = UserProfileResponse(
            id=str(result_data['id']),
            email=result_data['email'],
            display_name=result_data['display_name'],
            name=result_data['name'],
            department_name=result_data['department_name'],
            role=result_data['role'],
            created_at=result_data['created_at'] if isinstance(result_data['created_at'], str) else result_data['created_at'].isoformat() if result_data['created_at'] else datetime.now().isoformat()
        )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        structlog.get_logger().error("Failed to fetch user profile", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )

@router.put("/profile")
async def update_user_profile(
    profile_data: dict,
    user_id: str = Depends(get_current_user_id_from_jwt),
    db: DBConnection = Depends(get_db)
):
    """
    Update user's profile information
    """
    try:
        # First, check if user has an account in basejump.accounts
        client = await db.client
        account_result = await client.schema('basejump').from_('accounts').select('id').eq('primary_owner_user_id', user_id).execute()
        account = account_result.data[0] if account_result.data else None
        
        # Only allow certain fields to be updated
        allowed_fields = ['display_name', 'name', 'department_name']
        filtered_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
        
        if account:
            # Update basejump.accounts if account exists
            update_data = {}
            
            if 'display_name' in filtered_data:
                update_data['display_name'] = filtered_data['display_name']
            
            if 'name' in filtered_data:
                update_data['name'] = filtered_data['name']
                
            if 'department_name' in filtered_data:
                update_data['department_name'] = filtered_data['department_name']
            
            if update_data:
                update_data['updated_at'] = datetime.now().isoformat()
                
                result = await client.from_('basejump.accounts').update(update_data).eq('id', account['id']).execute()
                
                if not result.data:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Account not found"
                    )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Profile updated successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        structlog.get_logger().error("Failed to update user profile", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )
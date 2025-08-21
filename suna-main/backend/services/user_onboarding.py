"""
User onboarding service for creating default resources
"""

from services.supabase import DBConnection
from utils.logger import structlog
from datetime import datetime
import uuid

async def create_default_suna_agent(user_id: str) -> bool:
    """
    Create default SUNA agent for a new user
    
    Args:
        user_id: The user ID to create the agent for
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Generate new IDs
        new_agent_id = str(uuid.uuid4())
        new_version_id = str(uuid.uuid4())
        
        # Default configuration
        default_config = {
            "system_prompt": "You are Suna, an advanced AI assistant designed to help users with a wide variety of tasks. You have access to powerful tools and can assist with coding, research, analysis, and much more. Be helpful, accurate, and efficient in your responses.",
            "tools": {
                "mcp": [],
                "agentpress": {
                    "browser_tool": True,
                    "sb_files_tool": True,
                    "sb_shell_tool": True,
                    "sb_deploy_tool": True,
                    "sb_expose_tool": True,
                    "sb_sheets_tool": True,
                    "sb_vision_tool": True,
                    "web_search_tool": True,
                    "sb_image_edit_tool": True,
                    "data_providers_tool": True
                },
                "custom_mcp": []
            },
            "metadata": {
                "created_by": "system",
                "is_suna_default": True,
                "centrally_managed": True,
                "management_version": "1.0.0"
            }
        }
        
        # First insert the agent WITHOUT current_version_id
        agent_result = await client.table('agents').insert({
            "agent_id": new_agent_id,
            "account_id": user_id,
            "name": "Suna",
            "description": "Your intelligent AI assistant",
            "is_default": True,
            "avatar": "🤖",
            "avatar_color": "#3B82F6",
            "metadata": default_config["metadata"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "version_count": 1,
            "is_public": False,
            "tags": ["assistant", "default"]
        }).execute()
        
        if not agent_result.data:
            structlog.get_logger().error(f"Failed to create default agent for user {user_id}")
            return False
        
        # Then insert the agent version
        version_result = await client.table('agent_versions').insert({
            "version_id": new_version_id,
            "agent_id": new_agent_id,
            "version_number": 1,
            "version_name": "v1",
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "created_by": user_id,
            "config": default_config,
            "change_description": "Initial default Suna agent version"
        }).execute()
        
        if not version_result.data:
            structlog.get_logger().error(f"Failed to create default agent version for user {user_id}")
            return False
        
        # Finally update the agent with current_version_id
        update_result = await client.table('agents').update({
            "current_version_id": new_version_id,
            "updated_at": datetime.now().isoformat()
        }).eq('agent_id', new_agent_id).execute()
        
        if not update_result.data:
            structlog.get_logger().error(f"Failed to update agent with version_id for user {user_id}")
            return False
        
        structlog.get_logger().info(f"Successfully created default SUNA agent for user {user_id}")
        return True
        
    except Exception as e:
        structlog.get_logger().error(f"Error creating default agent for user {user_id}: {str(e)}")
        return False

async def ensure_user_has_default_agent(user_id: str) -> bool:
    """
    Ensure user has at least one agent, create default if none exists
    
    Args:
        user_id: The user ID to check
        
    Returns:
        bool: True if user has agents, False otherwise
    """
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Check if user has any agents
        agents_result = await client.table('agents').select('agent_id').eq('account_id', user_id).limit(1).execute()
        
        if not agents_result.data:
            # No agents found, create default
            return await create_default_suna_agent(user_id)
        
        return True
        
    except Exception as e:
        structlog.get_logger().error(f"Error checking user agents for {user_id}: {str(e)}")
        return False
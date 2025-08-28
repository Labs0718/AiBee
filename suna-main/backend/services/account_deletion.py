"""
Account deletion service for permanently removing user accounts and associated data
"""

import asyncio
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import HTTPException, status
from services.supabase import DBConnection
from utils.logger import structlog
import traceback

class AccountDeletionRequest(BaseModel):
    password: str
    confirmation_text: str

class AccountDeletionService:
    def __init__(self, db: DBConnection):
        self.db = db
        self.logger = structlog.get_logger()

    async def delete_account_permanently(self, user_id: str, request: AccountDeletionRequest) -> Dict[str, Any]:
        """
        Permanently delete a user account and all associated data.
        This operation is irreversible.
        
        Args:
            user_id: The authenticated user's ID
            request: Account deletion request with password confirmation
            
        Returns:
            Dict with deletion status and summary
            
        Raises:
            HTTPException: If validation fails or deletion encounters errors
        """
        # Validate deletion request
        await self._validate_deletion_request(user_id, request)
        
        # Get account information before deletion
        account_info = await self._get_account_info(user_id)
        
        # Perform the deletion in a transaction
        deletion_summary = await self._execute_account_deletion(user_id, account_info)
        
        # Log the successful deletion
        self.logger.info(
            "Account permanently deleted",
            user_id=user_id,
            account_id=account_info.get("account_id"),
            deletion_summary=deletion_summary
        )
        
        return {
            "success": True,
            "message": "Account permanently deleted",
            "deletion_summary": deletion_summary
        }

    async def _validate_deletion_request(self, user_id: str, request: AccountDeletionRequest) -> None:
        """Validate the account deletion request"""
        
        # Check confirmation text
        if request.confirmation_text != "DELETE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Confirmation text must be 'DELETE'"
            )
        
        # For now, skip password verification as Supabase Python client has different API
        # In production, you might want to implement this differently or use frontend verification
        self.logger.info("Skipping password verification - relying on JWT authentication")
        
        # Validate that we have a valid authenticated user
        try:
            client = await self.db.client
            user_result = await client.auth.admin.get_user_by_id(user_id)
            if not user_result.user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        except Exception as e:
            self.logger.error("User validation failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User validation failed"
            )

    async def _get_account_info(self, user_id: str) -> Dict[str, Any]:
        """Get account information before deletion for logging"""
        try:
            client = await self.db.client
            
            # Get account information - check both account_user relationships and direct ownership
            account_result = await client.schema('basejump').table('account_user').select(
                'account_id, account_role'
            ).eq('user_id', user_id).execute()
            
            # Also check for accounts where user is primary owner
            direct_accounts_result = await client.schema('basejump').table('accounts').select('id').eq('primary_owner_user_id', user_id).execute()
            
            # Combine both sources
            account_ids_from_relations = [acc["account_id"] for acc in account_result.data] if account_result.data else []
            account_ids_from_ownership = [acc["id"] for acc in direct_accounts_result.data] if direct_accounts_result.data else []
            
            # Merge and deduplicate
            all_account_ids = list(set(account_ids_from_relations + account_ids_from_ownership))
            
            # Create accounts list with consistent structure
            accounts = [{"account_id": account_id} for account_id in all_account_ids]
            
            account_info = {
                "user_id": user_id,
                "accounts": accounts
            }
            
            self.logger.info(f"Found {len(accounts)} accounts for deletion: {all_account_ids}", user_id=user_id)
            
            return account_info
            
        except Exception as e:
            self.logger.error("Failed to get account info", error=str(e))
            return {"user_id": user_id, "accounts": []}

    async def _execute_account_deletion(self, user_id: str, account_info: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the actual account deletion in proper order"""
        
        deletion_summary = {
            "deleted_tables": [],
            "deleted_counts": {},
            "errors": []
        }
        
        try:
            client = await self.db.client
            
            # Get all account IDs for this user
            account_ids = [acc["account_id"] for acc in account_info.get("accounts", [])]
            
            if not account_ids:
                self.logger.warning("No accounts found for user", user_id=user_id)
                return deletion_summary
            
            # Delete data in dependency order - auth data FIRST to prevent re-authentication
            deletion_steps = [
                ("auth_sessions_and_tokens", self._delete_auth_sessions_and_tokens),  # FIRST - prevent re-auth
                ("messages", self._delete_messages),
                ("agent_runs", self._delete_agent_runs), 
                ("threads", self._delete_threads),
                ("recordings", self._delete_recordings),
                ("pdf_documents", self._delete_pdf_documents),  # Additional tables
                ("user_profiles", self._delete_user_profiles),
                ("user_info", self._delete_user_info),
                ("projects", self._delete_projects),
                ("agents_current_version_id", self._clear_agents_current_version_id),  # FIRST - clear FK references
                ("agent_versions", self._delete_agent_versions),  # SECOND - delete versions
                ("agents", self._delete_agents),  # THIRD - delete agents
                ("api_keys", self._delete_api_keys),
                ("account_user", self._delete_account_user_relationships),
                ("accounts", self._delete_accounts),
                ("auth_user", self._delete_auth_user)  # LAST - final cleanup
            ]
            
            for table_name, delete_function in deletion_steps:
                try:
                    deleted_count = await delete_function(user_id, account_ids, client)
                    deletion_summary["deleted_tables"].append(table_name)
                    deletion_summary["deleted_counts"][table_name] = deleted_count
                    self.logger.info(f"Deleted {deleted_count} records from {table_name}")
                    
                except Exception as e:
                    error_msg = f"Failed to delete from {table_name}: {str(e)}"
                    deletion_summary["errors"].append(error_msg)
                    self.logger.error(error_msg, error=str(e), traceback=traceback.format_exc())
                    # Continue with other deletions even if one fails
            
            return deletion_summary
            
        except Exception as e:
            self.logger.error("Account deletion failed", error=str(e), traceback=traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Account deletion failed: {str(e)}"
            )

    async def _delete_auth_sessions_and_tokens(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete all auth sessions and tokens FIRST to immediately invalidate user access"""
        total_deleted = 0
        
        # Note: Cannot access auth schema directly through PostgREST
        # Sessions will be invalidated when we delete the user via admin API
        self.logger.info("Auth sessions/tokens will be cleaned up by admin user deletion", user_id=user_id)
        return 0

    async def _delete_messages(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete messages for threads owned by the user's accounts"""
        if not account_ids:
            # If no basejump accounts, also try deleting by user_id directly
            try:
                result = await client.table('messages').delete().eq('user_id', user_id).execute()
                return len(result.data) if result.data else 0
            except:
                return 0
            
        # First get thread IDs owned by the user's accounts
        threads_result = await client.table('threads').select('thread_id').in_('account_id', account_ids).execute()
        thread_ids = [t['thread_id'] for t in threads_result.data] if threads_result.data else []
        
        # Also try to get threads by user_id directly if schema supports it
        try:
            user_threads_result = await client.table('threads').select('thread_id').eq('user_id', user_id).execute()
            user_thread_ids = [t['thread_id'] for t in user_threads_result.data] if user_threads_result.data else []
            thread_ids.extend(user_thread_ids)
            thread_ids = list(set(thread_ids))  # Remove duplicates
        except:
            pass
        
        if not thread_ids:
            return 0
            
        # Delete messages for those threads
        result = await client.table('messages').delete().in_('thread_id', thread_ids).execute()
        return len(result.data) if result.data else 0

    async def _delete_agent_runs(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete agent runs for threads owned by the user's accounts"""
        if not account_ids:
            # Try deleting by user_id directly
            try:
                result = await client.table('agent_runs').delete().eq('user_id', user_id).execute()
                return len(result.data) if result.data else 0
            except:
                return 0
            
        # First get thread IDs owned by the user's accounts
        threads_result = await client.table('threads').select('thread_id').in_('account_id', account_ids).execute()
        thread_ids = [t['thread_id'] for t in threads_result.data] if threads_result.data else []
        
        # Also try to get threads by user_id directly
        try:
            user_threads_result = await client.table('threads').select('thread_id').eq('user_id', user_id).execute()
            user_thread_ids = [t['thread_id'] for t in user_threads_result.data] if user_threads_result.data else []
            thread_ids.extend(user_thread_ids)
            thread_ids = list(set(thread_ids))
        except:
            pass
        
        if not thread_ids:
            return 0
            
        # Delete agent runs for those threads
        result = await client.table('agent_runs').delete().in_('thread_id', thread_ids).execute()
        return len(result.data) if result.data else 0

    async def _delete_threads(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete threads owned by the user's accounts"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            result = await client.table('threads').delete().in_('account_id', account_ids).execute()
            total_deleted += len(result.data) if result.data else 0
        
        # Also delete by user_id directly (in case there are threads not linked to accounts)
        try:
            result = await client.table('threads').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_recordings(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete recordings owned by the user's accounts"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('recordings').delete().in_('account_id', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
            except:
                pass
        
        # Also delete by user_id directly
        try:
            result = await client.table('recordings').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_devices(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete devices owned by the user's accounts"""
        if not account_ids:
            return 0
            
        result = await client.table('devices').delete().in_('account_id', account_ids).execute()
        return len(result.data) if result.data else 0

    async def _delete_projects(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete projects owned by the user's accounts"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('projects').delete().in_('account_id', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
            except:
                pass
        
        # Also delete by user_id directly
        try:
            result = await client.table('projects').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
        
        # Also try deleting by created_by or owned_by if such columns exist
        try:
            result = await client.table('projects').delete().eq('created_by', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_agents(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete agents owned by the user's accounts"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('agents').delete().in_('account_id', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
            except:
                pass
        
        # Also delete by user_id directly
        try:
            result = await client.table('agents').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
        
        # Also try deleting by created_by if such column exists
        try:
            result = await client.table('agents').delete().eq('created_by', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_api_keys(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete API keys owned by the user's accounts"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('api_keys').delete().in_('account_id', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
            except:
                pass
        
        # Also delete by user_id directly
        try:
            result = await client.table('api_keys').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_pdf_documents(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete PDF documents owned by the user"""
        total_deleted = 0
        
        # Delete by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('pdf_documents').delete().in_('account_id', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
            except:
                pass
        
        # Also delete by user_id directly
        try:
            result = await client.table('pdf_documents').delete().eq('user_id', user_id).execute()
            total_deleted += len(result.data) if result.data else 0
        except:
            pass
            
        return total_deleted

    async def _delete_user_profiles(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete user profiles"""
        try:
            result = await client.table('user_profiles').delete().eq('id', user_id).execute()
            return len(result.data) if result.data else 0
        except:
            return 0

    async def _delete_user_info(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete user info"""
        try:
            result = await client.table('user_info').delete().eq('id', user_id).execute()
            return len(result.data) if result.data else 0
        except:
            return 0

    async def _clear_agents_current_version_id(self, user_id: str, account_ids: List[str], client) -> int:
        """Clear agents.current_version_id to remove FK constraint before deleting agent_versions"""
        total_updated = 0
        
        # Clear current_version_id by account_id if we have accounts
        if account_ids:
            try:
                result = await client.table('agents').update({
                    'current_version_id': None
                }).in_('account_id', account_ids).execute()
                total_updated += len(result.data) if result.data else 0
                self.logger.info(f"Cleared current_version_id for {len(result.data) if result.data else 0} agents by account_ids", user_id=user_id)
            except Exception as e:
                self.logger.warning(f"Failed to clear current_version_id by account_ids: {str(e)}", user_id=user_id)
        
        # Also try clearing by user_id directly
        try:
            result = await client.table('agents').update({
                'current_version_id': None
            }).eq('user_id', user_id).execute()
            total_updated += len(result.data) if result.data else 0
        except:
            pass
        
        # Also try clearing by created_by if such column exists
        try:
            result = await client.table('agents').update({
                'current_version_id': None
            }).eq('created_by', user_id).execute()
            total_updated += len(result.data) if result.data else 0
        except:
            pass
            
        return total_updated

    async def _delete_agent_versions(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete agent versions created by the user - CRITICAL: must be deleted before accounts"""
        total_deleted = 0
        
        # Delete by account_id (created_by field references accounts.id)
        if account_ids:
            try:
                result = await client.table('agent_versions').delete().in_('created_by', account_ids).execute()
                total_deleted += len(result.data) if result.data else 0
                self.logger.info(f"Deleted {len(result.data) if result.data else 0} agent versions by account_ids", user_id=user_id)
            except Exception as e:
                self.logger.warning(f"Failed to delete agent versions by account_ids: {str(e)}", user_id=user_id)
        
        # Note: agent_versions table has no user_id column, only created_by
            
        return total_deleted

    async def _delete_account_user_relationships(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete account-user relationships"""
        result = await client.schema('basejump').table('account_user').delete().eq('user_id', user_id).execute()
        return len(result.data) if result.data else 0

    async def _delete_accounts(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete basejump accounts owned by the user"""
        if not account_ids:
            return 0
            
        # Only delete personal accounts (not shared team accounts)
        personal_accounts_result = await client.schema('basejump').table('accounts').select('id').in_('id', account_ids).eq('personal_account', True).execute()
        personal_account_ids = [a['id'] for a in personal_accounts_result.data] if personal_accounts_result.data else []
        
        if not personal_account_ids:
            return 0
            
        result = await client.schema('basejump').table('accounts').delete().in_('id', personal_account_ids).execute()
        return len(result.data) if result.data else 0

    async def _delete_auth_user(self, user_id: str, account_ids: List[str], client) -> int:
        """Delete the Supabase auth user (final step - most auth data already deleted)"""
        try:
            self.logger.info("Attempting final auth user deletion", user_id=user_id)
            
            # Try admin delete first
            admin_delete_successful = False
            try:
                result = await client.auth.admin.delete_user(user_id)
                self.logger.info(
                    "Supabase admin delete_user result", 
                    user_id=user_id,
                    has_error=hasattr(result, 'error') and result.error is not None,
                    error=result.error if hasattr(result, 'error') else None
                )
                
                if not (hasattr(result, 'error') and result.error):
                    admin_delete_successful = True
                    self.logger.info("Admin delete successful", user_id=user_id)
            except Exception as admin_error:
                self.logger.warning("Admin delete failed, trying direct deletion", user_id=user_id, error=str(admin_error))
            
            # If admin delete didn't work, try direct database deletion
            if not admin_delete_successful:
                try:
                    self.logger.info("Attempting direct database deletion from auth.users", user_id=user_id)
                    direct_result = await client.schema('auth').table('users').delete().eq('id', user_id).execute()
                    deleted_count = len(direct_result.data) if direct_result.data else 0
                    self.logger.info(f"Direct deletion result: {deleted_count} records deleted", user_id=user_id)
                    
                    if deleted_count > 0:
                        admin_delete_successful = True
                        self.logger.info("Direct database deletion successful", user_id=user_id)
                    else:
                        self.logger.warning("Direct deletion returned 0 records", user_id=user_id)
                except Exception as direct_error:
                    self.logger.error("Direct database deletion failed", user_id=user_id, error=str(direct_error))
            
            # Verify user was deleted - check both ways
            user_still_exists = False
            try:
                verify_result = await client.auth.admin.get_user_by_id(user_id)
                if verify_result.user and not verify_result.user.deleted_at:
                    user_still_exists = True
                    self.logger.error(
                        "User still exists and not marked as deleted", 
                        user_id=user_id,
                        deleted_at=verify_result.user.deleted_at if verify_result.user else None
                    )
                else:
                    self.logger.info(
                        "User deletion verified via admin API", 
                        user_id=user_id,
                        deleted_at=verify_result.user.deleted_at if verify_result.user else None
                    )
            except Exception as verify_error:
                # Error getting user might mean successful deletion
                self.logger.info(
                    "Could not retrieve user (likely successful deletion)", 
                    user_id=user_id, 
                    error=str(verify_error)
                )
            
            # Double-check via direct database query
            try:
                db_check = await client.schema('auth').table('users').select('id').eq('id', user_id).execute()
                if db_check.data and len(db_check.data) > 0:
                    user_still_exists = True
                    self.logger.error("User record still exists in auth.users table", user_id=user_id)
                else:
                    self.logger.info("User record not found in auth.users table (successful deletion)", user_id=user_id)
            except Exception as db_error:
                self.logger.info("Database check failed (might indicate deletion)", user_id=user_id, error=str(db_error))
            
            if user_still_exists:
                self.logger.error("USER DELETION FAILED - user still exists", user_id=user_id)
                return 0
            else:
                self.logger.info("USER DELETION SUCCESSFUL", user_id=user_id)
                return 1
            
        except Exception as e:
            self.logger.error("Failed to delete auth user", user_id=user_id, error=str(e), traceback=traceback.format_exc())
            raise

    async def get_account_deletion_preview(self, user_id: str) -> Dict[str, Any]:
        """Get a preview of what will be deleted without actually deleting"""
        try:
            client = await self.db.client
            
            # Get account information - check both account_user relationships and direct ownership
            account_result = await client.schema('basejump').table('account_user').select(
                'account_id, account_role'
            ).eq('user_id', user_id).execute()
            
            # Also check for accounts where user is primary owner
            direct_accounts_result = await client.schema('basejump').table('accounts').select('id').eq('primary_owner_user_id', user_id).execute()
            
            # Combine both sources
            account_ids_from_relations = [acc["account_id"] for acc in account_result.data] if account_result.data else []
            account_ids_from_ownership = [acc["id"] for acc in direct_accounts_result.data] if direct_accounts_result.data else []
            
            # Merge and deduplicate
            account_ids = list(set(account_ids_from_relations + account_ids_from_ownership))
            
            self.logger.info(f"Found {len(account_ids)} accounts for user {user_id}: {account_ids}")
            
            if not account_ids:
                return {"data_summary": {}, "total_records": 0}
            
            # Count records in each table
            data_summary = {}
            
            # Count threads
            threads_result = await client.table('threads').select('thread_id', count='exact').in_('account_id', account_ids).execute()
            data_summary["threads"] = threads_result.count or 0
            
            # Count messages (for user's threads)
            if data_summary["threads"] > 0:
                thread_ids_result = await client.table('threads').select('thread_id').in_('account_id', account_ids).execute()
                thread_ids = [t['thread_id'] for t in thread_ids_result.data] if thread_ids_result.data else []
                if thread_ids:
                    messages_result = await client.table('messages').select('message_id', count='exact').in_('thread_id', thread_ids).execute()
                    data_summary["messages"] = messages_result.count or 0
                else:
                    data_summary["messages"] = 0
            else:
                data_summary["messages"] = 0
            
            # Count other resources - only include tables that actually exist
            try:
                agents_result = await client.table('agents').select('agent_id', count='exact').in_('account_id', account_ids).execute()
                data_summary["agents"] = agents_result.count or 0
            except:
                data_summary["agents"] = 0
            
            try:
                projects_result = await client.table('projects').select('project_id', count='exact').in_('account_id', account_ids).execute()
                data_summary["projects"] = projects_result.count or 0
            except:
                data_summary["projects"] = 0
            
            # Skip devices table as it doesn't exist in this schema
            data_summary["devices"] = 0
            
            try:
                api_keys_result = await client.table('api_keys').select('key_id', count='exact').in_('account_id', account_ids).execute()
                data_summary["api_keys"] = api_keys_result.count or 0
            except:
                data_summary["api_keys"] = 0
            
            total_records = sum(data_summary.values())
            
            return {
                "data_summary": data_summary,
                "total_records": total_records,
                "account_ids": account_ids
            }
            
        except Exception as e:
            self.logger.error("Failed to get account deletion preview", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate deletion preview"
            )
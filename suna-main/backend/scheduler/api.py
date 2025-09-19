from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

from services.supabase import DBConnection
from utils.auth_utils import get_current_user_id_from_jwt
from utils.logger import logger
from .scheduler_service import SchedulerService

router = APIRouter()

# Database connection
db = None
scheduler_service = None

def initialize(database: DBConnection, existing_scheduler_service=None):
    """Initialize the scheduler API with database connection"""
    global db, scheduler_service
    db = database
    # Use existing scheduler service if provided, otherwise create new one
    if existing_scheduler_service:
        scheduler_service = existing_scheduler_service
    else:
        scheduler_service = SchedulerService(db)

class ScheduledTaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    sheet_url: str = Field(..., min_length=1)
    task_prompt: str = Field(..., min_length=10)
    schedule_config: Dict[str, Any] = Field(...)  # type, time, day 등
    email_recipients: Optional[List[str]] = Field(default=[])
    is_active: bool = Field(default=True)

class ScheduledTaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    sheet_url: Optional[str] = Field(None, min_length=1)
    task_prompt: Optional[str] = Field(None, min_length=10)
    schedule_config: Optional[Dict[str, Any]] = Field(None)
    email_recipients: Optional[List[str]] = Field(None)
    is_active: Optional[bool] = Field(None)

class ScheduledTaskResponse(BaseModel):
    id: str  # UUID string from database
    user_id: str
    name: str
    description: Optional[str]
    sheet_url: str
    task_prompt: str
    schedule_config: Dict[str, Any]
    email_recipients: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
    run_count: int

@router.post("/scheduled-tasks", response_model=Dict[str, Any])
async def create_scheduled_task(
    request: Request,
    task_data: ScheduledTaskCreate,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """새로운 스케줄된 작업 생성"""
    try:
        logger.info(f"Creating scheduled task for user {user_id}: {task_data.name}")

        # Create task in database
        task = await scheduler_service.create_scheduled_task(
            user_id=user_id,
            name=task_data.name,
            description=task_data.description,
            sheet_url=task_data.sheet_url,
            task_prompt=task_data.task_prompt,
            schedule_config=task_data.schedule_config,
            email_recipients=task_data.email_recipients,
            is_active=task_data.is_active
        )

        if not task:
            raise HTTPException(status_code=400, detail="Failed to create scheduled task")

        # Add to scheduler if active
        if task_data.is_active:
            await scheduler_service.add_task_to_scheduler(task)

        return {
            "success": True,
            "message": "Scheduled task created successfully",
            "task": task
        }

    except Exception as e:
        logger.error(f"Error creating scheduled task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-tasks", response_model=List[ScheduledTaskResponse])
async def get_scheduled_tasks(
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """사용자의 스케줄된 작업 목록 조회"""
    try:
        tasks = await scheduler_service.get_user_scheduled_tasks(user_id)
        return tasks

    except Exception as e:
        logger.error(f"Error fetching scheduled tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-tasks/{task_id}", response_model=ScheduledTaskResponse)
async def get_scheduled_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """특정 스케줄된 작업 조회"""
    try:
        task = await scheduler_service.get_scheduled_task(task_id, user_id)

        if not task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        return task

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/scheduled-tasks/{task_id}", response_model=Dict[str, Any])
async def update_scheduled_task(
    task_id: str,
    task_data: ScheduledTaskUpdate,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 수정"""
    try:
        # Check if task exists and belongs to user
        existing_task = await scheduler_service.get_scheduled_task(task_id, user_id)
        if not existing_task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # Update task
        updated_task = await scheduler_service.update_scheduled_task(
            task_id=task_id,
            user_id=user_id,
            update_data=task_data.model_dump(exclude_unset=True)
        )

        if not updated_task:
            raise HTTPException(status_code=400, detail="Failed to update scheduled task")

        # Update scheduler if needed
        await scheduler_service.update_task_in_scheduler(updated_task)

        return {
            "success": True,
            "message": "Scheduled task updated successfully",
            "task": updated_task
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/scheduled-tasks/{task_id}", response_model=Dict[str, Any])
async def delete_scheduled_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 삭제"""
    try:
        # Check if task exists and belongs to user
        existing_task = await scheduler_service.get_scheduled_task(task_id, user_id)
        if not existing_task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # Remove from scheduler
        await scheduler_service.remove_task_from_scheduler(task_id)

        # Delete from database
        success = await scheduler_service.delete_scheduled_task(task_id, user_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete scheduled task")

        return {
            "success": True,
            "message": "Scheduled task deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scheduled-tasks/{task_id}/toggle", response_model=Dict[str, Any])
async def toggle_scheduled_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 활성화/비활성화"""
    try:
        task = await scheduler_service.get_scheduled_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # Toggle active status
        new_status = not task['is_active']
        updated_task = await scheduler_service.update_scheduled_task(
            task_id=task_id,
            user_id=user_id,
            update_data={'is_active': new_status}
        )

        # Update scheduler
        if new_status:
            await scheduler_service.add_task_to_scheduler(updated_task)
        else:
            await scheduler_service.remove_task_from_scheduler(task_id)

        return {
            "success": True,
            "message": f"Task {'activated' if new_status else 'deactivated'} successfully",
            "is_active": new_status
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scheduled-tasks/{task_id}/run", response_model=Dict[str, Any])
async def run_scheduled_task_now(
    task_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 즉시 실행 - 프론트엔드의 handleRunNow와 동일한 동작"""
    try:
        task = await scheduler_service.get_scheduled_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # Execute task - 프론트엔드가 호출하는 것과 동일하게 처리
        result = await scheduler_service.execute_scheduled_task(task)

        return {
            "success": True,
            "message": "Task executed successfully",
            "result": result,
            "trigger_frontend": True  # 프론트엔드에 실행 신호
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-tasks/{task_id}/logs", response_model=List[Dict[str, Any]])
async def get_task_execution_logs(
    task_id: str,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """작업 실행 로그 조회"""
    try:
        # Verify task ownership
        task = await scheduler_service.get_scheduled_task(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        logs = await scheduler_service.get_task_execution_logs(task_id, limit)
        return logs

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task logs {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduler/status", response_model=Dict[str, Any])
async def get_scheduler_status():
    """스케줄러 상태 조회"""
    try:
        status = await scheduler_service.get_scheduler_status()
        return status

    except Exception as e:
        logger.error(f"Error getting scheduler status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads", response_model=List[Dict[str, Any]])
async def get_mcp_automation_threads(
    category: str = Query(..., description="Thread category to filter by"),
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """MCP 자동화 채팅방 목록 조회"""
    try:
        if category != "mcp_automation":
            raise HTTPException(status_code=400, detail="Only mcp_automation category is supported")

        client = await db.client
        response = await client.table("threads").select(
            "thread_id, created_at, metadata"
        ).eq("account_id", user_id).execute()

        # MCP 자동화 카테고리 필터링
        mcp_threads = [
            thread for thread in response.data
            if thread.get("metadata", {}).get("category") == "mcp_automation"
        ]

        return mcp_threads

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching MCP automation threads: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
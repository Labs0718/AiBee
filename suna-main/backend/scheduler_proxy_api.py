"""
기존 스케줄러 API를 Triggers API로 연결하는 프록시
기존 프론트엔드 코드를 그대로 사용하면서 백엔드만 Triggers로 변경
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

from services.supabase import DBConnection
from utils.auth_utils import get_current_user_id_from_jwt
from utils.logger import logger
from triggers.trigger_service import get_trigger_service, TriggerType
from triggers.provider_service import get_provider_service

router = APIRouter(prefix="/scheduler", tags=["scheduler_proxy"])

# Database connection
db = None

def initialize(database: DBConnection):
    """Initialize the scheduler proxy API with database connection"""
    global db
    db = database

# 기존 스케줄러 API와 호환되는 모델들
class ScheduledTaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    sheet_url: str = Field(..., min_length=1)
    task_prompt: str = Field(..., min_length=10, max_length=500)
    schedule_config: Dict[str, Any] = Field(...)  # type, time, day 등
    email_recipients: Optional[List[str]] = Field(default=[])
    is_active: bool = Field(default=True)

class ScheduledTaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    sheet_url: Optional[str] = Field(None, min_length=1)
    task_prompt: Optional[str] = Field(None, min_length=10, max_length=500)
    schedule_config: Optional[Dict[str, Any]] = Field(None)
    email_recipients: Optional[List[str]] = Field(None)
    is_active: Optional[bool] = Field(None)

def cron_to_kst_schedule_config(cron_expression: str) -> Dict[str, Any]:
    """UTC Cron 표현식을 KST 기준 스케줄 설정으로 역변환"""
    import pytz
    from datetime import datetime

    try:
        parts = cron_expression.split()
        if len(parts) >= 5:
            minute, hour, day, month, weekday = parts

            # UTC 시간을 KST로 변환
            utc_tz = pytz.UTC
            kst_tz = pytz.timezone('Asia/Seoul')

            # 오늘 날짜로 UTC 시간 생성
            today = datetime.now(utc_tz).date()
            utc_time = utc_tz.localize(datetime.combine(today, datetime.min.time().replace(hour=int(hour), minute=int(minute))))
            kst_time = utc_time.astimezone(kst_tz)

            kst_hour = kst_time.hour
            kst_minute = kst_time.minute

            # 스케줄 타입 결정
            if weekday != '*':
                schedule_type = 'weekly'
                return {
                    'type': schedule_type,
                    'time': f"{kst_hour:02d}:{kst_minute:02d}",
                    'day': int(weekday)
                }
            elif day != '*':
                schedule_type = 'monthly'
                return {
                    'type': schedule_type,
                    'time': f"{kst_hour:02d}:{kst_minute:02d}",
                    'day': int(day)
                }
            else:
                schedule_type = 'daily'
                return {
                    'type': schedule_type,
                    'time': f"{kst_hour:02d}:{kst_minute:02d}"
                }
    except Exception as e:
        logger.warning(f"Failed to convert cron to KST schedule: {e}")

    # 기본값
    return {'type': 'daily', 'time': '17:00'}

def schedule_config_to_cron(schedule_config: Dict[str, Any]) -> str:
    """스케줄 설정을 Cron 표현식으로 변환 (Korea Time 기준)"""
    import pytz
    from datetime import datetime

    schedule_type = schedule_config.get('type')
    time_str = schedule_config.get('time', '17:00')
    day = schedule_config.get('day')

    # 시간 파싱
    try:
        hour, minute = map(int, time_str.split(':'))
    except:
        hour, minute = 17, 0  # 기본값

    # Korea Time을 UTC로 변환
    try:
        kst_tz = pytz.timezone('Asia/Seoul')
        utc_tz = pytz.UTC

        # 오늘 날짜로 KST 시간 생성
        today = datetime.now(kst_tz).date()
        kst_time = kst_tz.localize(datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute)))
        utc_time = kst_time.astimezone(utc_tz)

        utc_hour = utc_time.hour
        utc_minute = utc_time.minute

        logger.info(f"Converted KST {hour:02d}:{minute:02d} to UTC {utc_hour:02d}:{utc_minute:02d}")

    except Exception as e:
        logger.warning(f"Failed to convert timezone, using original time: {e}")
        utc_hour, utc_minute = hour, minute

    if schedule_type == 'daily':
        return f"{utc_minute} {utc_hour} * * *"
    elif schedule_type == 'weekly':
        # day는 0=일요일, 1=월요일 등
        day_num = day if day is not None else 0
        return f"{utc_minute} {utc_hour} * * {day_num}"
    elif schedule_type == 'monthly':
        # day는 1-31
        day_num = day if day is not None else 1
        return f"{utc_minute} {utc_hour} {day_num} * *"
    else:
        # 기본: 매일
        return f"{utc_minute} {utc_hour} * * *"

def create_agent_prompt(task_prompt: str, sheet_url: str, email_recipients: List[str]) -> str:
    """에이전트 프롬프트 생성"""
    prompt = f"""작업 내용: {task_prompt}

스프레드시트 URL: {sheet_url}

위 스프레드시트에 접근해서 요청된 작업을 수행해주세요."""

    if email_recipients:
        prompt += f"\n\n작업 완료 후 다음 이메일 주소로 결과를 알려주세요: {', '.join(email_recipients)}"

    return prompt

@router.post("/scheduled-tasks", response_model=Dict[str, Any])
async def create_scheduled_task(
    request: Request,
    task_data: ScheduledTaskCreate,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """새로운 스케줄된 작업 생성 (Triggers API로 프록시)"""
    try:
        logger.info(f"Creating scheduled task for user {user_id}: {task_data.name}")

        # 1. Cron 표현식 생성
        cron_expression = schedule_config_to_cron(task_data.schedule_config)

        # 2. 에이전트 프롬프트 생성
        agent_prompt = create_agent_prompt(
            task_data.task_prompt,
            task_data.sheet_url,
            task_data.email_recipients or []
        )

        # 3. 사용자의 기본 에이전트 가져오기
        client = await db.client
        agent_response = await client.table("agents").select("agent_id").eq("account_id", user_id).eq("is_default", True).limit(1).execute()

        if not agent_response.data:
            raise HTTPException(status_code=400, detail="Default agent not found")

        agent_id = agent_response.data[0]['agent_id']

        # 4. Triggers API로 트리거 생성
        trigger_service = get_trigger_service(db)
        provider_service = get_provider_service(db)

        # 스케줄 제공자 가져오기
        schedule_provider = await provider_service.get_provider("schedule")
        if not schedule_provider:
            raise HTTPException(status_code=500, detail="Schedule provider not available")

        # 트리거 설정
        trigger_config = {
            'cron_expression': cron_expression,
            'execution_type': 'agent',
            'agent_prompt': agent_prompt,
            'timezone': 'Asia/Seoul'
        }

        # 설정 검증
        validated_config = await schedule_provider.validate_config(trigger_config)

        # 트리거 생성
        trigger = await trigger_service.create_trigger(
            agent_id=agent_id,
            provider_id="schedule",
            name=task_data.name,
            description=task_data.description,
            config=validated_config,
            is_active=task_data.is_active
        )

        if not trigger:
            raise HTTPException(status_code=500, detail="Failed to create trigger")

        # 5. 호환성을 위해 기존 API 형태로 응답
        task_response = {
            "id": trigger.trigger_id,
            "user_id": user_id,
            "name": task_data.name,
            "description": task_data.description,
            "sheet_url": task_data.sheet_url,
            "task_prompt": task_data.task_prompt,
            "schedule_config": task_data.schedule_config,
            "email_recipients": task_data.email_recipients or [],
            "is_active": task_data.is_active,
            "created_at": trigger.created_at.isoformat(),
            "updated_at": trigger.updated_at.isoformat(),
            "next_run_at": None,  # Triggers에서는 계산하지 않음
            "run_count": 0
        }

        return {
            "success": True,
            "message": "Scheduled task created successfully",
            "task": task_response
        }

    except Exception as e:
        logger.error(f"Error creating scheduled task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-tasks", response_model=List[Dict[str, Any]])
async def get_scheduled_tasks(
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """사용자의 스케줄된 작업 목록 조회 (Triggers에서)"""
    try:
        trigger_service = get_trigger_service(db)

        # 사용자의 모든 스케줄 트리거 가져오기
        triggers = await trigger_service.get_user_triggers(user_id, provider_id="schedule")
        logger.info(f"Found {len(triggers)} triggers for user {user_id}")

        # 기존 API 형태로 변환
        tasks = []
        for trigger in triggers:
            # 트리거 설정에서 원본 정보 복원
            config = trigger.config
            agent_prompt = config.get('agent_prompt', '')

            # 간단한 파싱으로 원본 정보 추출
            import re
            sheet_url = ""
            task_prompt = ""
            email_recipients = []

            # 작업 내용 추출 (여러 줄 지원)
            task_match = re.search(r'작업 내용: (.+?)(?=\n\n|스프레드시트 URL:|$)', agent_prompt, re.DOTALL)
            if task_match:
                task_prompt = task_match.group(1).strip()

            # URL 패턴 찾기
            url_match = re.search(r'스프레드시트 URL: (https?://[^\s]+)', agent_prompt)
            if url_match:
                sheet_url = url_match.group(1)

            # 이메일 주소 추출
            email_match = re.search(r'이메일 주소로 결과를 알려주세요: (.+?)(?:\n|$)', agent_prompt)
            if email_match:
                email_str = email_match.group(1).strip()
                # 쉼표로 구분된 이메일들을 리스트로 변환
                email_recipients = [email.strip() for email in email_str.split(',')]

            # Cron 표현식을 KST 기준 스케줄 설정으로 역변환
            cron_expr = config.get('cron_expression', '0 17 * * *')
            schedule_config = cron_to_kst_schedule_config(cron_expr)

            task = {
                "id": trigger.trigger_id,
                "name": trigger.name,
                "description": trigger.description,
                "sheet_url": sheet_url,
                "task_prompt": task_prompt,
                "schedule_config": schedule_config,
                "email_recipients": email_recipients,
                "is_active": trigger.is_active,
                "created_at": trigger.created_at.isoformat(),
                "last_run_at": None,
                "next_run_at": None,
                "run_count": 0
            }
            tasks.append(task)

        return tasks

    except Exception as e:
        logger.error(f"Error fetching scheduled tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/scheduled-tasks/{task_id}", response_model=Dict[str, Any])
async def delete_scheduled_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 삭제 (Triggers에서)"""
    try:
        trigger_service = get_trigger_service(db)

        # 트리거 삭제
        success = await trigger_service.delete_trigger(task_id)

        if not success:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

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
    """스케줄된 작업 활성화/비활성화 (Triggers에서)"""
    try:
        trigger_service = get_trigger_service(db)

        # 트리거 가져오기
        trigger = await trigger_service.get_trigger(task_id)
        if not trigger:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # 상태 토글
        new_status = not trigger.is_active
        success = await trigger_service.update_trigger(
            task_id,
            is_active=new_status
        )

        if not success:
            raise HTTPException(status_code=400, detail="Failed to toggle task status")

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

@router.put("/scheduled-tasks/{task_id}", response_model=Dict[str, Any])
async def update_scheduled_task(
    task_id: str,
    task_data: ScheduledTaskUpdate,
    user_id: str = Depends(get_current_user_id_from_jwt)
):
    """스케줄된 작업 수정 (Triggers에서)"""
    try:
        trigger_service = get_trigger_service(db)

        # 트리거 가져오기
        trigger = await trigger_service.get_trigger(task_id)
        if not trigger:
            raise HTTPException(status_code=404, detail="Scheduled task not found")

        # 수정할 설정 준비
        update_data = {}

        if task_data.name is not None:
            update_data['name'] = task_data.name

        if task_data.description is not None:
            update_data['description'] = task_data.description

        if task_data.is_active is not None:
            update_data['is_active'] = task_data.is_active

        # 스케줄 또는 프롬프트 변경 시 config 업데이트
        if any([task_data.schedule_config, task_data.task_prompt, task_data.sheet_url, task_data.email_recipients]):
            # 기존 config 가져오기
            current_config = trigger.config.copy()

            # 새로운 스케줄 설정이 있으면 cron 표현식 업데이트
            if task_data.schedule_config:
                cron_expression = schedule_config_to_cron(task_data.schedule_config)
                current_config['cron_expression'] = cron_expression

            # 프롬프트 관련 업데이트
            if any([task_data.task_prompt, task_data.sheet_url, task_data.email_recipients]):
                import re
                current_agent_prompt = current_config.get('agent_prompt', '')

                # 기존 정보 추출
                sheet_url = task_data.sheet_url or ""
                task_prompt = task_data.task_prompt or ""
                email_recipients = task_data.email_recipients or []

                # 변경되지 않은 정보는 기존에서 추출
                if not sheet_url:
                    url_match = re.search(r'스프레드시트 URL: (https?://[^\s]+)', current_agent_prompt)
                    if url_match:
                        sheet_url = url_match.group(1)

                if not task_prompt:
                    task_match = re.search(r'작업 내용: (.+?)(?=\n\n|스프레드시트 URL:|$)', current_agent_prompt, re.DOTALL)
                    if task_match:
                        task_prompt = task_match.group(1).strip()

                if not email_recipients:
                    email_match = re.search(r'이메일 주소로 결과를 알려주세요: (.+?)(?:\n|$)', current_agent_prompt)
                    if email_match:
                        email_str = email_match.group(1).strip()
                        email_recipients = [email.strip() for email in email_str.split(',')]

                # 새 프롬프트 생성
                agent_prompt = create_agent_prompt(task_prompt, sheet_url, email_recipients)
                current_config['agent_prompt'] = agent_prompt

            update_data['config'] = current_config

        # 트리거 업데이트
        updated_trigger = await trigger_service.update_trigger(task_id, **update_data)

        # 응답 생성
        return {
            "success": True,
            "message": "Scheduled task updated successfully",
            "task": {
                "id": updated_trigger.trigger_id,
                "name": updated_trigger.name,
                "description": updated_trigger.description,
                "is_active": updated_trigger.is_active,
                "updated_at": updated_trigger.updated_at.isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating scheduled task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduler/status", response_model=Dict[str, Any])
async def get_scheduler_status():
    """스케줄러 상태 조회 (Triggers 시스템 사용 중)"""
    try:
        return {
            "is_running": "triggers_system",
            "note": "Using Triggers system with Supabase Cron",
            "job_count": "N/A",
            "jobs": []
        }

    except Exception as e:
        logger.error(f"Error getting scheduler status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
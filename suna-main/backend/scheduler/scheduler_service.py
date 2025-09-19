import asyncio
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor

from utils.logger import logger
from services.supabase import DBConnection
from mcp_module.mcp_service import mcp_service
from services import email_api


class SchedulerService:
    def __init__(self, db: DBConnection):
        self.db = db
        self.scheduler = None
        self.is_running = False

    async def initialize(self):
        """스케줄러 초기화"""
        # Memory 기반 JobStore 설정 (Redis가 없는 환경에서도 동작)
        jobstores = {
            'default': MemoryJobStore()
        }

        executors = {
            'default': AsyncIOExecutor()
        }

        job_defaults = {
            'coalesce': False,
            'max_instances': 1,
            'misfire_grace_time': 60
        }

        self.scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone='Asia/Seoul'
        )

        logger.info("MCP Scheduler initialized")

    async def start_scheduler(self):
        """스케줄러 시작"""
        if self.scheduler and not self.is_running:
            self.scheduler.start()
            self.is_running = True

            # 기존 활성 작업들을 스케줄러에 추가
            await self.load_active_tasks()

            logger.info("MCP Scheduler started")

    async def stop_scheduler(self):
        """스케줄러 중지"""
        if self.scheduler and self.is_running:
            self.scheduler.shutdown(wait=False)
            self.is_running = False
            logger.info("MCP Scheduler stopped")

    async def load_active_tasks(self):
        """활성화된 작업들을 스케줄러에 로드"""
        try:
            client = await self.db.client
            response = await client.table("scheduled_tasks").select("*").eq("is_active", True).execute()

            for task in response.data:
                await self.add_task_to_scheduler(task)

            logger.info(f"Loaded {len(response.data)} active scheduled tasks")

        except Exception as e:
            logger.error(f"Error loading active tasks: {str(e)}")

    async def create_scheduled_task(
        self,
        user_id: str,
        name: str,
        sheet_url: str,
        task_prompt: str,
        schedule_config: Dict[str, Any],
        description: Optional[str] = None,
        email_recipients: Optional[List[str]] = None,
        is_active: bool = True
    ) -> Dict[str, Any]:
        """새로운 스케줄된 작업 생성"""
        try:
            client = await self.db.client

            task_data = {
                "user_id": user_id,
                "name": name,
                "description": description,
                "sheet_url": sheet_url,
                "task_prompt": task_prompt,
                "schedule_config": schedule_config,
                "email_recipients": email_recipients or [],
                "is_active": is_active,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "run_count": 0
            }

            # Calculate next run time
            next_run = self.calculate_next_run_time(schedule_config)
            if next_run:
                task_data["next_run_at"] = next_run.isoformat()

            response = await client.table("scheduled_tasks").insert(task_data).execute()

            logger.info(f"Created scheduled task: {name} for user {user_id}")
            return response.data[0]

        except Exception as e:
            logger.error(f"Error creating scheduled task: {str(e)}")
            raise

    async def get_user_scheduled_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """사용자의 스케줄된 작업 목록 조회"""
        try:
            client = await self.db.client
            response = await client.table("scheduled_tasks").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data

        except Exception as e:
            logger.error(f"Error fetching user scheduled tasks: {str(e)}")
            raise

    async def get_scheduled_task(self, task_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """특정 스케줄된 작업 조회"""
        try:
            client = await self.db.client
            response = await client.table("scheduled_tasks").select("*").eq("id", task_id).eq("user_id", user_id).execute()

            if response.data:
                return response.data[0]
            return None

        except Exception as e:
            logger.error(f"Error fetching scheduled task {task_id}: {str(e)}")
            raise

    async def update_scheduled_task(
        self,
        task_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """스케줄된 작업 수정"""
        try:
            client = await self.db.client

            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

            # If schedule_config is updated, recalculate next_run_at
            if "schedule_config" in update_data:
                next_run = self.calculate_next_run_time(update_data["schedule_config"])
                if next_run:
                    update_data["next_run_at"] = next_run.isoformat()

            response = await client.table("scheduled_tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()

            if response.data:
                logger.info(f"Updated scheduled task {task_id}")
                return response.data[0]

            raise Exception("Task not found or update failed")

        except Exception as e:
            logger.error(f"Error updating scheduled task {task_id}: {str(e)}")
            raise

    async def delete_scheduled_task(self, task_id: str, user_id: str) -> bool:
        """스케줄된 작업 삭제"""
        try:
            client = await self.db.client
            response = await client.table("scheduled_tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()

            if response.data:
                logger.info(f"Deleted scheduled task {task_id}")
                return True

            return False

        except Exception as e:
            logger.error(f"Error deleting scheduled task {task_id}: {str(e)}")
            raise

    async def add_task_to_scheduler(self, task: Dict[str, Any]):
        """스케줄러에 작업 추가"""
        if not self.scheduler or not task.get('is_active'):
            return

        try:
            task_id = task['id']
            schedule_config = task['schedule_config']

            # 기존 job 제거
            try:
                self.scheduler.remove_job(f"task_{task_id}")
            except:
                pass

            # 크론 트리거 생성
            trigger = self.create_cron_trigger(schedule_config)
            if not trigger:
                logger.warning(f"Could not create trigger for task {task_id}")
                return

            # 스케줄러에 작업 추가
            self.scheduler.add_job(
                func=self.execute_scheduled_task,
                trigger=trigger,
                args=[task],
                id=f"task_{task_id}",
                replace_existing=True,
                misfire_grace_time=300  # 5분
            )

            logger.info(f"Added task {task_id} to scheduler")

        except Exception as e:
            logger.error(f"Error adding task {task['id']} to scheduler: {str(e)}")

    async def remove_task_from_scheduler(self, task_id: str):
        """스케줄러에서 작업 제거"""
        if not self.scheduler:
            return

        try:
            self.scheduler.remove_job(f"task_{task_id}")
            logger.info(f"Removed task {task_id} from scheduler")
        except:
            # Job이 존재하지 않을 수 있음
            pass

    async def update_task_in_scheduler(self, task: Dict[str, Any]):
        """스케줄러의 작업 업데이트"""
        await self.remove_task_from_scheduler(task['id'])
        if task.get('is_active'):
            await self.add_task_to_scheduler(task)

    def create_cron_trigger(self, schedule_config: Dict[str, Any]) -> Optional[CronTrigger]:
        """스케줄 설정에서 크론 트리거 생성"""
        try:
            schedule_type = schedule_config.get('type')
            time_str = schedule_config.get('time', '17:00')
            day = schedule_config.get('day')

            # 시간 파싱
            hour, minute = map(int, time_str.split(':'))

            if schedule_type == 'daily':
                return CronTrigger(hour=hour, minute=minute)
            elif schedule_type == 'weekly':
                if day is not None:
                    day_of_week = int(day)  # 0=일요일, 1=월요일, ...
                    return CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute)
            elif schedule_type == 'monthly':
                if day is not None:
                    day_of_month = int(day)  # 1-31
                    return CronTrigger(day=day_of_month, hour=hour, minute=minute)

            return None

        except Exception as e:
            logger.error(f"Error creating cron trigger: {str(e)}")
            return None

    def calculate_next_run_time(self, schedule_config: Dict[str, Any]) -> Optional[datetime]:
        """다음 실행 시간 계산"""
        trigger = self.create_cron_trigger(schedule_config)
        if trigger:
            return trigger.get_next_fire_time(None, datetime.now(timezone.utc))
        return None

    async def execute_scheduled_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """스케줄된 작업 실행"""
        task_id = task['id']
        task_name = task['name']

        logger.info(f"Executing scheduled task: {task_name} (ID: {task_id})")

        try:
            # 실행 시작 로그
            await self.log_task_execution(task_id, "started", None, None)

            # SheetAgent 프롬프트 생성
            sheet_agent_prompt = self.create_sheet_agent_prompt(
                task['sheet_url'],
                task['task_prompt'],
                task.get('email_recipients', [])
            )

            # 에이전트에게 직접 프롬프트 전송
            result = await self.send_prompt_to_agent(task['user_id'], sheet_agent_prompt, task['name'])

            # 이메일 발송
            await self.send_task_result_email(task, result)

            # 실행 완료 업데이트
            await self.update_task_after_execution(task_id, True, result)

            # 성공 로그
            await self.log_task_execution(task_id, "completed", result, None)

            logger.info(f"Successfully executed task {task_id}")

            return {
                "success": True,
                "result": result
            }

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error executing task {task_id}: {error_msg}")

            # 실패 업데이트
            await self.update_task_after_execution(task_id, False, None, error_msg)

            # 실패 로그
            await self.log_task_execution(task_id, "failed", None, error_msg)

            return {
                "success": False,
                "error": error_msg
            }


    async def send_prompt_to_agent(self, user_id: str, prompt: str, task_name: str = None) -> Dict[str, Any]:
        """기존 agent API를 사용해서 질문 전송"""
        try:
            import httpx
            from datetime import datetime, timezone

            # 내부 API 호출로 thread 생성
            async with httpx.AsyncClient() as client:
                # 1. 새 스레드 생성
                thread_response = await client.post(
                    "http://localhost:8000/api/threads",
                    headers={"Authorization": f"Bearer {await self.get_user_access_token(user_id)}"},
                    data={"name": f"MCP 자동화: {task_name or '자동화 작업'}"}
                )

                if thread_response.status_code != 200:
                    logger.error(f"Thread creation failed: {thread_response.status_code} - {thread_response.text}")
                    return {"success": False, "error": "채팅방 생성 실패"}

                thread_data = thread_response.json()
                thread_id = thread_data["thread_id"]

                # 2. 메시지 전송
                message_response = await client.post(
                    f"http://localhost:8000/api/threads/{thread_id}/messages",
                    headers={
                        "Authorization": f"Bearer {await self.get_user_access_token(user_id)}",
                        "Content-Type": "application/json"
                    },
                    json={"content": prompt}
                )

                if message_response.status_code != 200:
                    logger.error(f"Message send failed: {message_response.status_code} - {message_response.text}")
                    return {"success": False, "error": "메시지 전송 실패"}

                logger.info(f"Successfully sent prompt to thread {thread_id} for user {user_id}")

                return {
                    "success": True,
                    "message": "질문이 자동으로 전송되었습니다",
                    "thread_id": thread_id
                }

        except Exception as e:
            logger.error(f"Error sending prompt to agent: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_user_access_token(self, user_id: str) -> str:
        """사용자의 액세스 토큰 가져오기 (임시 - 실제로는 Supabase JWT 사용)"""
        # 실제 구현에서는 Supabase에서 사용자 토큰을 가져와야 함
        # 지금은 임시로 빈 문자열 반환
        return ""

    async def update_thread_metadata(self, thread_id: str, task_name: str):
        """스레드에 폴더 구조 metadata 추가"""
        try:
            from datetime import datetime, timezone

            client = await self.db.client
            now = datetime.now(timezone.utc)
            date_str = now.strftime('%Y-%m-%d')

            metadata = {
                "category": "spreadsheet_automation",
                "auto_generated": True,
                "execution_time": now.isoformat(),
                "scheduled_execution": True,
                "task_name": task_name or "자동화 작업",
                "execution_date": date_str,
                "folder_structure": {
                    "main_folder": "스프레드시트 자동화",
                    "task_folder": task_name or "자동화 작업",
                    "date_folder": date_str
                }
            }

            await client.table("threads").update({
                "metadata": metadata,
                "updated_at": now.isoformat()
            }).eq("thread_id", thread_id).execute()

            logger.info(f"Updated thread {thread_id} metadata for automation")

        except Exception as e:
            logger.error(f"Error updating thread metadata: {str(e)}")

    async def execute_mcp_task(self, task: Dict[str, Any], prompt: str) -> Any:
        """새 채팅방에서 MCP 작업 실행"""
        try:
            # 1. 새 채팅방(thread) 생성
            thread_id = await self.create_scheduled_thread(task, prompt)

            # 2. 채팅방에서 에이전트 실행
            result = await self.run_agent_in_thread(thread_id, prompt, task['user_id'])

            return {
                "thread_id": thread_id,
                "result": result
            }

        except Exception as e:
            logger.error(f"Error executing MCP task: {str(e)}")
            raise

    async def create_scheduled_thread(self, task: Dict[str, Any], prompt: str) -> str:
        """스케줄된 작업을 위한 새 채팅방 생성"""
        try:
            from datetime import datetime, timezone

            client = await self.db.client

            # 채팅방 메타데이터에 MCP 자동화 표시 (폴더 구조)
            now = datetime.now(timezone.utc)
            date_str = now.strftime('%m%d')  # 0918 형식

            metadata = {
                "scheduled_task_id": task['id'],
                "scheduled_task_name": task['name'],
                "category": "mcp_automation",
                "mcp_task_folder": task['name'],     # 첫 번째 폴더: 작업명 (WBS 마감일 체크)
                "mcp_date_folder": date_str,         # 두 번째 폴더: 날짜 (0918)
                "mcp_status_folder": f"{date_str}_실행중",  # 세 번째 폴더: 날짜_상태 (0918_실행중)
                "mcp_status": "실행중",              # 상태: 실행중 -> 실행완료
                "auto_generated": True,
                "execution_time": now.isoformat(),
                "background_execution": True         # 백그라운드 실행 표시
            }

            # threads 테이블에 새 채팅방 생성
            thread_response = await client.table("threads").insert({
                "account_id": task['user_id'],
                "metadata": metadata,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }).execute()

            thread_id = thread_response.data[0]['thread_id']

            # 사용자 메시지 추가 (프롬프트)
            await client.table("messages").insert({
                "thread_id": thread_id,
                "type": "human",
                "is_llm_message": False,
                "content": {"content": prompt},
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }).execute()

            logger.info(f"Created scheduled thread {thread_id} for task {task['id']}")
            return thread_id

        except Exception as e:
            logger.error(f"Error creating scheduled thread: {str(e)}")
            raise

    async def run_agent_in_thread(self, thread_id: str, prompt: str, user_id: str) -> str:
        """지정된 채팅방에서 에이전트 실행"""
        try:
            from datetime import datetime, timezone
            # 기존 에이전트 실행 API 사용
            # agent/api.py의 start_agent 함수와 유사한 방식

            # 사용자의 기본 에이전트 가져오기
            client = await self.db.client
            agent_response = await client.table("agents").select("*, agent_versions(*)").eq("account_id", user_id).eq("is_default", True).limit(1).execute()

            if not agent_response.data:
                raise Exception("No default agent found for user")

            agent = agent_response.data[0]

            # 에이전트 실행을 위한 설정
            agent_config = {
                "model_name": "claude-3-5-sonnet-20241022",
                "enable_thinking": False,
                "agent_id": agent['agent_id'],
                "agent_version_id": agent['current_version_id']
            }

            # 사용자 메시지를 채팅방에 추가
            message_response = await client.table("messages").insert({
                "thread_id": thread_id,
                "account_id": user_id,
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

            logger.info(f"Created scheduled thread {thread_id} and sent prompt")
            return {"thread_id": thread_id, "message": "프롬프트가 전송되었습니다"}

        except Exception as e:
            logger.error(f"Error running agent in thread: {str(e)}")
            raise

    async def update_thread_status(self, thread_id: str, new_status: str):
        """채팅방 상태 업데이트 (실행중 -> 실행결과)"""
        try:
            from datetime import datetime, timezone

            client = await self.db.client

            # 기존 메타데이터 가져오기
            thread_response = await client.table("threads").select("metadata").eq("thread_id", thread_id).execute()

            if thread_response.data:
                metadata = thread_response.data[0]['metadata']

                # 메타데이터 업데이트 (폴더 이동)
                metadata['mcp_status'] = new_status

                # 상태 폴더 업데이트 (0918_실행중 → 0918_실행완료)
                date_str = metadata.get('mcp_date_folder', datetime.now(timezone.utc).strftime('%m%d'))
                new_status_korean = "실행완료" if new_status == "실행결과" else new_status
                metadata['mcp_status_folder'] = f"{date_str}_{new_status_korean}"

                # 데이터베이스 업데이트
                await client.table("threads").update({
                    "metadata": metadata,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }).eq("thread_id", thread_id).execute()

                logger.info(f"Updated thread {thread_id} status to {new_status}")

        except Exception as e:
            logger.error(f"Error updating thread status: {str(e)}")

    async def start_agent_in_thread(self, thread_id: str, agent_config: dict, user_id: str):
        """스레드에서 에이전트 시작 (백그라운드 실행)"""
        try:
            from datetime import datetime, timezone
            import uuid

            client = await self.db.client

            # agent_run 생성
            agent_run_data = {
                "thread_id": thread_id,
                "account_id": user_id,
                "agent_id": agent_config["agent_id"],
                "agent_version_id": agent_config["agent_version_id"],
                "model_name": agent_config["model_name"],
                "enable_thinking": agent_config.get("enable_thinking", False),
                "status": "running",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "background_execution": True  # 백그라운드 실행 표시
            }

            run_response = await client.table("agent_runs").insert(agent_run_data).execute()
            agent_run_id = run_response.data[0]["agent_run_id"]

            # 백그라운드에서 실제 에이전트 실행
            import asyncio
            asyncio.create_task(self.execute_agent_run(agent_run_id, thread_id, agent_config))

            logger.info(f"Started background agent execution for thread {thread_id}")

        except Exception as e:
            logger.error(f"Error starting agent in thread: {str(e)}")
            raise

    async def execute_agent_run(self, agent_run_id: str, thread_id: str, agent_config: dict):
        """실제 에이전트 실행 (백그라운드)"""
        try:
            # agent.run 모듈을 사용하여 에이전트 실행
            from agent.run import run_agent
            from agentpress.thread_manager import ThreadManager

            thread_manager = ThreadManager(
                db=self.db,
                instance_id="scheduler"
            )

            # 에이전트 실행
            await run_agent(
                agent_run_id=agent_run_id,
                thread_id=thread_id,
                instance_id="scheduler",
                project_id=agent_config["agent_id"],
                model_name=agent_config["model_name"],
                enable_thinking=agent_config.get("enable_thinking", False),
                reasoning_effort=None,
                stream=False,  # 백그라운드이므로 스트리밍 불필요
                enable_context_manager=True,
                agent_config=agent_config,
                is_agent_builder=False,
                target_agent_id=None,
                request_id=None,
                is_simple_mode=True
            )

            logger.info(f"Completed background agent execution for run {agent_run_id}")

        except Exception as e:
            logger.error(f"Error executing agent run {agent_run_id}: {str(e)}")

            # 실패 상태로 업데이트
            try:
                client = await self.db.client
                await client.table("agent_runs").update({
                    "status": "failed",
                    "error_message": str(e),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }).eq("agent_run_id", agent_run_id).execute()
            except:
                pass

    async def wait_for_agent_completion(self, thread_id: str, timeout: int = 300) -> str:
        """에이전트 실행 완료까지 대기"""
        import asyncio

        try:
            client = await self.db.client

            for _ in range(timeout // 5):  # 5초마다 체크, 최대 5분 대기
                # 에이전트 런 상태 확인
                run_response = await client.table("agent_runs").select("status").eq("thread_id", thread_id).order("created_at", desc=True).limit(1).execute()

                if run_response.data:
                    status = run_response.data[0]['status']
                    if status in ['completed', 'failed']:
                        break

                await asyncio.sleep(5)

            # 최신 AI 메시지 가져오기
            message_response = await client.table("messages").select("content").eq("thread_id", thread_id).eq("type", "ai").order("created_at", desc=True).limit(1).execute()

            if message_response.data:
                content = message_response.data[0]['content']
                if isinstance(content, dict):
                    return content.get('content', str(content))
                return str(content)

            return "Agent execution completed but no response found"

        except Exception as e:
            logger.error(f"Error waiting for agent completion: {str(e)}")
            return f"Agent execution error: {str(e)}"

    async def send_task_result_email(self, task: Dict[str, Any], result: Any):
        """작업 결과 이메일 발송"""
        try:
            recipients = task.get('email_recipients', [])
            if not recipients:
                # 기본적으로 작업 생성자에게 발송
                client = await self.db.client
                user_response = await client.table("users").select("email").eq("id", task['user_id']).execute()
                if user_response.data:
                    recipients = [user_response.data[0]['email']]

            if not recipients:
                logger.warning(f"No email recipients for task {task['id']}")
                return

            subject = f"[자동화 결과] {task['name']} 작업 완료"

            body = f"""안녕하세요,

자동화 작업이 완료되었습니다.

작업명: {task['name']}
실행 시간: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}
스프레드시트: {task['sheet_url']}

작업 결과:
{str(result)[:1000]}...

자세한 내용은 첨부된 결과를 확인해주세요.

감사합니다.

---
MCP 자동화 시스템
"""

            # 이메일 발송
            for recipient in recipients:
                await email_api.send_email(
                    to_email=recipient,
                    subject=subject,
                    body=body
                )

            logger.info(f"Task result email sent to {len(recipients)} recipients")

        except Exception as e:
            logger.error(f"Error sending task result email: {str(e)}")

    async def update_task_after_execution(
        self,
        task_id: str,
        success: bool,
        result: Any = None,
        error: str = None
    ):
        """작업 실행 후 업데이트"""
        try:
            client = await self.db.client

            update_data = {
                "last_run_at": datetime.now(timezone.utc).isoformat(),
                "run_count": client.table("scheduled_tasks").select("run_count").eq("id", task_id).execute().data[0]["run_count"] + 1
            }

            # 다음 실행 시간 계산
            task_response = await client.table("scheduled_tasks").select("schedule_config").eq("id", task_id).execute()
            if task_response.data:
                schedule_config = task_response.data[0]['schedule_config']
                next_run = self.calculate_next_run_time(schedule_config)
                if next_run:
                    update_data["next_run_at"] = next_run.isoformat()

            await client.table("scheduled_tasks").update(update_data).eq("id", task_id).execute()

        except Exception as e:
            logger.error(f"Error updating task after execution: {str(e)}")

    async def log_task_execution(
        self,
        task_id: str,
        status: str,
        result: Any = None,
        error: str = None
    ):
        """작업 실행 로그 저장"""
        try:
            client = await self.db.client

            log_data = {
                "task_id": task_id,
                "status": status,
                "executed_at": datetime.now(timezone.utc).isoformat(),
                "result": str(result) if result else None,
                "error": error
            }

            await client.table("scheduled_task_logs").insert(log_data).execute()

        except Exception as e:
            logger.error(f"Error logging task execution: {str(e)}")

    async def get_task_execution_logs(self, task_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """작업 실행 로그 조회"""
        try:
            client = await self.db.client
            response = await client.table("scheduled_task_logs").select("*").eq("task_id", task_id).order("executed_at", desc=True).limit(limit).execute()
            return response.data

        except Exception as e:
            logger.error(f"Error fetching task execution logs: {str(e)}")
            return []

    async def get_scheduler_status(self) -> Dict[str, Any]:
        """스케줄러 상태 조회"""
        try:
            running_jobs = []
            if self.scheduler:
                jobs = self.scheduler.get_jobs()
                running_jobs = [
                    {
                        "id": job.id,
                        "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
                    }
                    for job in jobs
                ]

            return {
                "is_running": self.is_running,
                "job_count": len(running_jobs),
                "jobs": running_jobs
            }

        except Exception as e:
            logger.error(f"Error getting scheduler status: {str(e)}")
            return {"is_running": False, "job_count": 0, "jobs": []}
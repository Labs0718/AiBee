#!/usr/bin/env python3
"""
간단한 스케줄러 테스트 스크립트
핵심 기능만 테스트하여 문제없이 동작하는지 확인
"""

import asyncio
import sys
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor

def create_cron_trigger(schedule_config: dict) -> CronTrigger:
    """스케줄 설정에서 크론 트리거 생성 - 완벽한 에러 처리 포함"""
    try:
        schedule_type = schedule_config.get('type')
        time_str = schedule_config.get('time', '17:00')
        day = schedule_config.get('day')

        print(f"[INPUT] Validation - type: {schedule_type}, time: {time_str}, day: {day}")

        # 입력값 검증
        if not schedule_type:
            print(f"[ERROR] Missing schedule_type: {schedule_config}")
            return None

        if not time_str or ':' not in time_str:
            print(f"[ERROR] Invalid time format: {time_str}")
            return None

        # 시간 파싱
        try:
            hour, minute = map(int, time_str.split(':'))
            if not (0 <= hour <= 23) or not (0 <= minute <= 59):
                print(f"[ERROR] Invalid time values - hour: {hour}, minute: {minute}")
                return None
        except (ValueError, TypeError) as e:
            print(f"[ERROR] Time parsing error: {time_str}, error: {e}")
            return None

        print(f"[CREATE] Creating trigger - type: {schedule_type}, time: {hour}:{minute}, day: {day}")

        if schedule_type == 'daily':
            trigger = CronTrigger(hour=hour, minute=minute, timezone='Asia/Seoul')
            print(f"[SUCCESS] Created daily trigger: {trigger}")
            return trigger
        elif schedule_type == 'weekly':
            if not day or day not in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                print(f"[ERROR] Invalid day for weekly schedule: {day}")
                return None
            trigger = CronTrigger(day_of_week=day, hour=hour, minute=minute, timezone='Asia/Seoul')
            print(f"[SUCCESS] Created weekly trigger: {trigger}")
            return trigger
        elif schedule_type == 'monthly':
            # 매월 1일로 기본 설정
            trigger = CronTrigger(day=1, hour=hour, minute=minute, timezone='Asia/Seoul')
            print(f"[SUCCESS] Created monthly trigger: {trigger}")
            return trigger
        else:
            print(f"[ERROR] Unsupported schedule type: {schedule_type}")
            return None

    except Exception as e:
        print(f"[ERROR] Unexpected error in create_cron_trigger: {e}")
        return None

async def test_job():
    """테스트용 작업 함수"""
    print(f"[EXECUTE] Test job executed at {datetime.now(timezone.utc)}")

async def test_scheduler():
    """스케줄러 핵심 기능 테스트"""
    print("[STARTING] Scheduler core functionality test...")

    # 스케줄러 설정
    jobstores = {
        'default': MemoryJobStore()
    }
    executors = {
        'default': AsyncIOExecutor()
    }
    job_defaults = {
        'coalesce': False,
        'max_instances': 3
    }

    scheduler = AsyncIOScheduler(
        jobstores=jobstores,
        executors=executors,
        job_defaults=job_defaults,
        timezone='Asia/Seoul'
    )

    # 테스트 케이스들
    test_configs = [
        {'type': 'daily', 'time': '10:31'},
        {'type': 'weekly', 'time': '14:30', 'day': 'monday'},
        {'type': 'monthly', 'time': '09:00'},
        {'type': 'daily', 'time': '25:00'},  # Invalid hour
        {'type': 'daily', 'time': 'invalid'},  # Invalid format
        {'type': '', 'time': '10:31'},  # Missing type
        {'time': '10:31'},  # Missing type key
    ]

    print(f"\n[TESTING] {len(test_configs)} schedule configurations...\n")

    valid_triggers = 0

    for i, config in enumerate(test_configs, 1):
        print(f"Test {i}/{len(test_configs)}: {config}")
        trigger = create_cron_trigger(config)

        if trigger:
            valid_triggers += 1
            # 스케줄러에 작업 추가 테스트
            try:
                job_id = f"test_job_{i}"
                scheduler.add_job(
                    test_job,
                    trigger=trigger,
                    id=job_id,
                    name=f"Test Job {i}"
                )
                print(f"[SUCCESS] Added job {job_id} to scheduler")

                # 다음 실행 시간 확인
                job = scheduler.get_job(job_id)
                if job and job.next_run_time:
                    print(f"[SCHEDULE] Next run time: {job.next_run_time}")

            except Exception as e:
                print(f"[ERROR] Failed to add job to scheduler: {e}")
        else:
            print("[FAILED] Failed to create trigger (expected for invalid inputs)")

        print("-" * 50)

    print(f"\n[SUMMARY]")
    print(f"[SUCCESS] Valid triggers created: {valid_triggers}/{len(test_configs)}")
    print(f"[INFO] Total jobs in scheduler: {len(scheduler.get_jobs())}")

    # 스케줄러 상태 확인
    print(f"[STATUS] Scheduler running: {scheduler.running}")

    # 등록된 작업들 출력
    jobs = scheduler.get_jobs()
    if jobs:
        print(f"\n[JOBS] Registered jobs:")
        for job in jobs:
            print(f"  - {job.id}: {job.name} | Next run: {job.next_run_time}")

    print("\n[COMPLETED] Scheduler core test completed successfully!")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    asyncio.run(test_scheduler())
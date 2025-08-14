#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import platform
import os
import json

# Windows 인코딩 문제 해결
if platform.system() == "Windows":
    import locale
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    os.environ['PYTHONLEGACYWINDOWSSTDIO'] = '1'
    # Windows에서 콘솔 출력을 UTF-8로 설정
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

def run_subprocess_safe(cmd, **kwargs):
    """Windows에서 안전한 subprocess 실행"""
    try:
        if IS_WINDOWS:
            # Windows에서 안전한 실행을 위한 설정
            kwargs.update({
                'encoding': 'utf-8',
                'errors': 'replace',
                'shell': True,
                'creationflags': subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
            })
        return subprocess.run(cmd, **kwargs)
    except UnicodeDecodeError:
        # 인코딩 에러 발생시 바이트 모드로 재시도
        kwargs.pop('encoding', None)
        kwargs.pop('errors', None)
        kwargs['text'] = False
        result = subprocess.run(cmd, **kwargs)
        # 결과를 안전하게 디코딩
        if hasattr(result, 'stdout') and result.stdout:
            result.stdout = result.stdout.decode('utf-8', errors='replace')
        if hasattr(result, 'stderr') and result.stderr:
            result.stderr = result.stderr.decode('utf-8', errors='replace')
        return result

IS_WINDOWS = platform.system() == "Windows"
PROGRESS_FILE = ".setup_progress"


# --- ANSI Colors ---
class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def load_progress():
    """Loads the last saved step and data from setup."""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            try:
                return json.load(f)
            except (json.JSONDecodeError, KeyError):
                return {"step": 0, "data": {}}
    return {"step": 0, "data": {}}


def get_setup_method():
    """Gets the setup method chosen during setup."""
    progress = load_progress()
    return progress.get("data", {}).get("setup_method")


def check_docker_available():
    """Check if Docker is available and running."""
    try:
        if IS_WINDOWS:
            result = subprocess.run(["docker", "version"], capture_output=True, shell=True, check=True, text=False)
        else:
            result = subprocess.run(["docker", "version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"{Colors.RED}❌ Docker is not running or not installed.{Colors.ENDC}")
        print(f"{Colors.YELLOW}Please start Docker and try again.{Colors.ENDC}")
        return False

def check_docker_compose_up():
    try:
        # Windows에서 안전한 subprocess 실행
        if IS_WINDOWS:
            result = subprocess.run(
                ["docker", "compose", "ps", "-q"],
                capture_output=True,
                text=False,  # 바이트 모드로 실행
                shell=True
            )
            # 수동으로 안전하게 디코딩
            stdout = result.stdout.decode('utf-8', errors='replace').strip() if result.stdout else ""
            return len(stdout) > 0
        else:
            result = subprocess.run(
                ["docker", "compose", "ps", "-q"],
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
            return len(result.stdout.strip()) > 0
    except Exception as e:
        print(f"{Colors.RED}Error checking docker compose status: {e}{Colors.ENDC}")
        return False


def print_manual_instructions():
    """Prints instructions for manually starting Suna services."""
    print(f"\n{Colors.BLUE}{Colors.BOLD}🚀 Manual Startup Instructions{Colors.ENDC}\n")

    print("To start Suna, you need to run these commands in separate terminals:\n")

    print(f"{Colors.BOLD}1. Start Infrastructure (in project root):{Colors.ENDC}")
    print(f"{Colors.CYAN}   docker compose up redis rabbitmq -d{Colors.ENDC}\n")

    print(f"{Colors.BOLD}2. Start Frontend (in a new terminal):{Colors.ENDC}")
    print(f"{Colors.CYAN}   cd frontend && npm run dev{Colors.ENDC}\n")

    print(f"{Colors.BOLD}3. Start Backend (in a new terminal):{Colors.ENDC}")
    print(f"{Colors.CYAN}   cd backend && uv run api.py{Colors.ENDC}\n")

    print(f"{Colors.BOLD}4. Start Background Worker (in a new terminal):{Colors.ENDC}")
    print(
        f"{Colors.CYAN}   cd backend && uv run dramatiq run_agent_background{Colors.ENDC}\n"
    )

    print("Once all services are running, access Suna at: http://localhost:3000\n")

    print(
        f"{Colors.YELLOW}💡 Tip:{Colors.ENDC} You can use '{Colors.CYAN}./start.py{Colors.ENDC}' to start/stop the infrastructure services."
    )


def main():
    setup_method = get_setup_method()

    if "--help" in sys.argv:
        print("Usage: ./start.py [OPTION]")
        print("Manage Suna services based on your setup method")
        print("\nOptions:")
        print("  -f\tForce start containers without confirmation")
        print("  --help\tShow this help message")
        return

    # If setup hasn't been run or method is not determined, default to docker
    if not setup_method:
        print(
            f"{Colors.YELLOW}⚠️  Setup method not detected. Run './setup.py' first or using Docker Compose as default.{Colors.ENDC}"
        )
        setup_method = "docker"

    if setup_method == "manual":
        # For manual setup, we only manage infrastructure services (redis, rabbitmq)
        # and show instructions for the rest
        print(f"{Colors.BLUE}{Colors.BOLD}Manual Setup Detected{Colors.ENDC}")
        print("Managing infrastructure services (Redis, RabbitMQ)...\n")

        force = "-f" in sys.argv
        if force:
            print("Force awakened. Skipping confirmation.")

        try:
            if IS_WINDOWS:
                is_infra_up = subprocess.run(
                    ["docker", "compose", "ps", "-q", "redis", "rabbitmq"],
                    capture_output=True,
                    text=False,
                    shell=True
                )
                stdout = is_infra_up.stdout.decode('utf-8', errors='replace').strip() if is_infra_up.stdout else ""
                is_infra_up.stdout = stdout
            else:
                is_infra_up = subprocess.run(
                    ["docker", "compose", "ps", "-q", "redis", "rabbitmq"],
                    capture_output=True,
                    text=True,
                    encoding='utf-8'
                )
        except Exception as e:
            print(f"{Colors.RED}Error checking infrastructure status: {e}{Colors.ENDC}")
            return
        is_up = len(is_infra_up.stdout.strip()) > 0

        if is_up:
            action = "stop"
            msg = "🛑 Stop infrastructure services? [y/N] "
        else:
            action = "start"
            msg = "⚡ Start infrastructure services? [Y/n] "

        if not force:
            response = input(msg).strip().lower()
            if action == "stop":
                if response != "y":
                    print("Aborting.")
                    return
            else:
                if response == "n":
                    print("Aborting.")
                    return

        if action == "stop":
            try:
                subprocess.run(["docker", "compose", "down"], shell=IS_WINDOWS)
                print(f"\n{Colors.GREEN}✅ Infrastructure services stopped.{Colors.ENDC}")
            except Exception as e:
                print(f"{Colors.RED}Error stopping services: {e}{Colors.ENDC}")
        else:
            try:
                subprocess.run(
                    ["docker", "compose", "up", "redis", "rabbitmq", "-d"], shell=IS_WINDOWS
                )
                print(f"\n{Colors.GREEN}✅ Infrastructure services started.{Colors.ENDC}")
                print_manual_instructions()
            except Exception as e:
                print(f"{Colors.RED}Error starting services: {e}{Colors.ENDC}")

    else:  # docker setup
        print(f"{Colors.BLUE}{Colors.BOLD}Docker Setup Detected{Colors.ENDC}")
        print("Managing all Suna services with Docker Compose...\n")

        force = "-f" in sys.argv
        if force:
            print("Force awakened. Skipping confirmation.")

        if not check_docker_available():
            return
            
        is_up = check_docker_compose_up()

        if is_up:
            action = "stop"
            msg = "🛑 Stop all Suna services? [y/N] "
        else:
            action = "start"
            msg = "⚡ Start all Suna services? [Y/n] "

        if not force:
            response = input(msg).strip().lower()
            if action == "stop":
                if response != "y":
                    print("Aborting.")
                    return
            else:
                if response == "n":
                    print("Aborting.")
                    return

        if action == "stop":
            try:
                subprocess.run(["docker", "compose", "down"], shell=IS_WINDOWS)
                print(f"\n{Colors.GREEN}✅ All Suna services stopped.{Colors.ENDC}")
            except Exception as e:
                print(f"{Colors.RED}Error stopping services: {e}{Colors.ENDC}")
        else:
            try:
                subprocess.run(["docker", "compose", "up", "-d"], shell=IS_WINDOWS)
                print(f"\n{Colors.GREEN}✅ All Suna services started.{Colors.ENDC}")
                print(f"{Colors.CYAN}🌐 Access Suna at: http://localhost:3000{Colors.ENDC}")
            except Exception as e:
                print(f"{Colors.RED}Error starting services: {e}{Colors.ENDC}")


if __name__ == "__main__":
    main()

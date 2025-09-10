from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import openai
import os
import json
from typing import Optional, List, Dict
from utils.auth_utils import get_current_user_id_from_jwt
from utils.logger import logger
from services import redis

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class SimpleChatRequest(BaseModel):
    message: str
    model_name: Optional[str] = "gpt-3.5-turbo"
    enable_thinking: Optional[bool] = False
    reasoning_effort: Optional[str] = "low"
    session_id: Optional[str] = None

class SimpleChatResponse(BaseModel):
    response: str
    model_used: str
    session_id: str

class ChatHistory(BaseModel):
    messages: List[Dict[str, str]]

async def get_session_messages(user_id: str, session_id: str) -> List[Dict[str, str]]:
    """세션의 대화 기록을 Redis에서 가져옴"""
    try:
        key = f"simple_chat_session:{user_id}:{session_id}"
        messages_json = await redis.get(key)
        if messages_json:
            return json.loads(messages_json)
        return []
    except Exception as e:
        logger.error(f"Error getting session messages: {str(e)}")
        return []

async def save_session_messages(user_id: str, session_id: str, messages: List[Dict[str, str]]):
    """세션의 대화 기록을 Redis에 저장 (세션 동안만 유효)"""
    try:
        key = f"simple_chat_session:{user_id}:{session_id}"
        messages_json = json.dumps(messages)
        # 세션은 1시간 후 만료
        await redis.set(key, messages_json, ex=3600)
    except Exception as e:
        logger.error(f"Error saving session messages: {str(e)}")

async def save_permanent_chat_history(user_id: str, user_message: str, ai_response: str):
    """영구 대화 기록을 Redis에 저장"""
    try:
        key = f"simple_chat_history:{user_id}"
        timestamp = int(os.times().elapsed * 1000)  # 밀리초 타임스탬프
        chat_entry = {
            "timestamp": timestamp,
            "user_message": user_message,
            "ai_response": ai_response
        }
        await redis.rpush(key, json.dumps(chat_entry))
        # 영구 기록은 30일 후 만료
        await redis.expire(key, 30 * 24 * 3600)
    except Exception as e:
        logger.error(f"Error saving permanent chat history: {str(e)}")

@router.post("/simple-chat", response_model=SimpleChatResponse)
async def simple_chat(
    chat_request: SimpleChatRequest,
    request: Request
):
    """
    단순한 OpenAI API 호출을 통한 챗봇 기능 (메모리 기능 포함)
    """
    try:
        # OpenAI API 키 확인
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # 사용자 인증
        user_id = await get_current_user_id_from_jwt(request)
        
        # 세션 ID 생성 또는 사용
        import uuid
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        # 지원되는 모델 매핑
        model_mapping = {
            "claude-3-5-sonnet-20241022": "gpt-4",
            "claude-sonnet-4": "gpt-4",
            "gpt-4-turbo": "gpt-4-turbo",
            "gpt-4": "gpt-4",
            "gpt-3.5-turbo": "gpt-3.5-turbo"
        }
        
        # 요청된 모델을 OpenAI 모델로 매핑
        openai_model = model_mapping.get(chat_request.model_name, "gpt-3.5-turbo")
        
        logger.info(f"Simple chat request from user {user_id} using model {openai_model}, session {session_id}")
        
        # 세션의 기존 대화 기록 가져오기
        session_messages = await get_session_messages(user_id, session_id)
        
        # 현재 사용자 메시지 추가
        session_messages.append({"role": "user", "content": chat_request.message})
        
        # OpenAI API 호출 (전체 대화 기록 포함)
        response = openai.chat.completions.create(
            model=openai_model,
            messages=session_messages,
            max_tokens=1500,
            temperature=0.7
        )
        
        # 응답 추출
        ai_response = response.choices[0].message.content
        
        # AI 응답을 세션 메시지에 추가
        session_messages.append({"role": "assistant", "content": ai_response})
        
        # 세션 메시지 저장 (세션 동안만)
        await save_session_messages(user_id, session_id, session_messages)
        
        # 영구 대화 기록 저장 (계속 지속)
        await save_permanent_chat_history(user_id, chat_request.message, ai_response)
        
        logger.info(f"Simple chat response generated successfully for user {user_id}")
        
        return SimpleChatResponse(
            response=ai_response,
            model_used=openai_model,
            session_id=session_id
        )
        
    except openai.OpenAIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except Exception as e:
        logger.error(f"Simple chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/simple-chat/history", response_model=List[Dict])
async def get_chat_history(request: Request):
    """사용자의 영구 대화 기록 조회"""
    try:
        user_id = await get_current_user_id_from_jwt(request)
        key = f"simple_chat_history:{user_id}"
        
        # Redis에서 대화 기록 가져오기
        history_entries = await redis.lrange(key, 0, -1)
        history = []
        
        for entry_json in history_entries:
            try:
                entry = json.loads(entry_json)
                history.append(entry)
            except json.JSONDecodeError:
                continue
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/simple-chat/session/{session_id}")
async def clear_session(session_id: str, request: Request):
    """특정 세션의 대화 기록 삭제"""
    try:
        user_id = await get_current_user_id_from_jwt(request)
        key = f"simple_chat_session:{user_id}:{session_id}"
        
        result = await redis.delete(key)
        return {"message": "Session cleared successfully", "cleared": result > 0}
        
    except Exception as e:
        logger.error(f"Error clearing session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
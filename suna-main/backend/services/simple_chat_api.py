from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import openai
import os
from typing import Optional
from utils.auth_utils import get_current_user_id_from_jwt
from utils.logger import logger

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class SimpleChatRequest(BaseModel):
    message: str
    model_name: Optional[str] = "gpt-3.5-turbo"
    enable_thinking: Optional[bool] = False
    reasoning_effort: Optional[str] = "low"

class SimpleChatResponse(BaseModel):
    response: str
    model_used: str

@router.post("/simple-chat", response_model=SimpleChatResponse)
async def simple_chat(
    chat_request: SimpleChatRequest,
    request: Request
):
    """
    단순한 OpenAI API 호출을 통한 챗봇 기능
    """
    try:
        # OpenAI API 키 확인
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # 사용자 인증
        user_id = await get_current_user_id_from_jwt(request)
        
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
        
        logger.info(f"Simple chat request from user {user_id} using model {openai_model}")
        
        # OpenAI API 호출
        response = openai.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "user", "content": chat_request.message}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        # 응답 추출
        ai_response = response.choices[0].message.content
        
        logger.info(f"Simple chat response generated successfully for user {user_id}")
        
        return SimpleChatResponse(
            response=ai_response,
            model_used=openai_model
        )
        
    except openai.OpenAIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except Exception as e:
        logger.error(f"Simple chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
from agentpress.tool import Tool, ToolResult, openapi_schema, usage_example
from sandbox.tool_base import SandboxToolsBase
from agentpress.thread_manager import ThreadManager
from pdf_documents.ollama_embeddings import OllamaEmbeddingProcessor
import asyncio
import json

class SandboxPdfSearchTool(SandboxToolsBase):
    """Tool for searching internal PDF documents using vector embeddings."""

    def __init__(self, project_id: str, thread_manager: ThreadManager):
        super().__init__(project_id, thread_manager)
        self.processor = OllamaEmbeddingProcessor()

    @openapi_schema({
        "type": "function",
        "function": {
            "name": "search_internal_documents",
            "description": "Search through uploaded PDF documents using semantic similarity to find relevant internal documents and information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to find relevant documents. Use natural language describing what you're looking for."
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of document chunks to return",
                        "default": 5,
                        "minimum": 1,
                        "maximum": 10
                    },
                    "filter_department": {
                        "type": "string",
                        "description": "Optional department filter to search within specific department documents",
                        "default": None
                    }
                },
                "required": ["query"]
            }
        }
    })
    @usage_example({
        "query": "search query example",
        "max_results": 5
    })
    async def search_internal_documents(self, query: str, max_results: int = 5, filter_department: str = None) -> ToolResult:
        """Search internal PDF documents using vector similarity"""
        try:
            print(f"[PDF_SEARCH] 검색 시작: '{query}'")

            # 검색 실행
            results = await self.processor.search_similar_documents(
                query=query.strip(),
                match_count=max_results,
                filter_department=filter_department
            )
            
            print("[PDF_SEARCH] search_internal_documents 도구 호출 완료")
            print("[PDF_SEARCH] PDF 검색 결과 분석 중...")
            
            if not results:
                print(f"[PDF_SEARCH] 검색 결과 없음: {query}")
                return ToolResult(
                    success=True,
                    output="검색된 문서가 없습니다. 다른 키워드로 시도해보세요."
                )

            print(f"[PDF_SEARCH] 검색 완료: {len(results)}개 문서 발견")

            # 결과 포맷팅
            formatted_content = f"**검색 결과** ({len(results)}건)\n\n"

            for i, result in enumerate(results, 1):
                similarity = round(result.get("similarity", 0), 3)
                document_title = result.get("document_title", "제목 없음")
                chunk_text = result.get("chunk_text", "")
                department = result.get("department", "부서 정보 없음")

                # 텍스트 길이 제한
                if len(chunk_text) > 300:
                    chunk_text = chunk_text[:300] + "..."

                formatted_content += f"**{i}. {document_title}** (유사도: {similarity})\n"
                formatted_content += f"부서: {department}\n"
                formatted_content += f"내용: {chunk_text}\n\n"
            
            return ToolResult(
                success=True,
                output=formatted_content
            )
            
        except Exception as e:
            print(f"[PDF_SEARCH] 오류 발생: {str(e)}")
            return ToolResult(
                success=False,
                output=f"내부 문서 검색 중 오류가 발생했습니다: {str(e)}"
            )
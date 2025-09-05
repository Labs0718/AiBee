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
            "description": "Search through uploaded PDF documents using semantic similarity. Perfect for finding internal policies, past complaint cases, response manuals, and guidelines related to civil complaints and administrative procedures.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to find relevant internal documents. Use natural language describing what you're looking for. Examples: '교통 정체 민원 대응 사례', '소음 문제 해결 방안', '주차 관련 정책 문서'"
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
        "query": "교통 정체 민원 대응 사례",
        "max_results": 5
    })
    async def search_internal_documents(self, query: str, max_results: int = 5, filter_department: str = None) -> ToolResult:
        """Search internal PDF documents using vector similarity"""
        try:
            print("[PDF_SEARCH] 내부문서 검색 시작")
            print(f"[PDF_SEARCH] 검색 키워드: {query}")
            print("[PDF_SEARCH] search_internal_documents 도구 호출 중...")
            
            # 검색 실행
            results = await self.processor.search_similar_documents(
                query=query,
                match_count=max_results,
                filter_department=filter_department
            )
            
            print("[PDF_SEARCH] search_internal_documents 도구 호출 완료")
            print("[PDF_SEARCH] PDF 검색 결과 분석 중...")
            
            if not results:
                print(f"[PDF_SEARCH] PDF 검색 실패: {query}")
                print("[PDF_SEARCH] 발견된 문서: 0개")
                return ToolResult(
                    success=True,
                    content="내부 문서에서 관련 자료를 찾지 못했습니다. 다른 키워드로 검색하거나 웹 검색을 활용해보세요.",
                    metadata={"total_results": 0}
                )
            
            # 검색 성공 로그
            print(f"[PDF_SEARCH] PDF 검색 성공: {query}")
            print(f"[PDF_SEARCH] 발견된 문서: {len(results)}개")
            
            # 결과 포맷팅
            formatted_content = f"**내부 문서 검색 결과** ({len(results)}건)\n\n"
            
            for i, result in enumerate(results, 1):
                similarity = round(result.get("similarity", 0), 3)
                document_title = result.get("document_title", "제목 없음")
                chunk_text = result.get("chunk_text", "")
                department = result.get("department", "부서 정보 없음")
                
                # 텍스트 길이 제한 (너무 길면 요약)
                if len(chunk_text) > 300:
                    chunk_text = chunk_text[:300] + "..."
                
                formatted_content += f"**{i}. {document_title}** (유사도: {similarity})\n"
                formatted_content += f"부서: {department}\n"
                formatted_content += f"내용: {chunk_text}\n\n"
            
            # 검색 팁 추가
            formatted_content += "**활용 가이드**: 위 내부 문서 정보를 바탕으로 공식적인 대응 방안을 수립하고, 웹 검색으로 최신 동향을 추가 조사하세요.\n"
            
            return ToolResult(
                success=True,
                content=formatted_content,
                metadata={
                    "total_results": len(results),
                    "query": query,
                    "search_type": "internal_documents"
                }
            )
            
        except Exception as e:
            print(f"[PDF_SEARCH] 오류 발생: {str(e)}")
            return ToolResult(
                success=False,
                content=f"내부 문서 검색 중 오류가 발생했습니다: {str(e)}",
                metadata={"error": str(e)}
            )
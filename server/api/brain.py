from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter()

# LangChain LLM for Arabic using Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY"),
) if os.getenv("GOOGLE_API_KEY") else None

ARABIC_SYSTEM_PROMPT = """أنت مساعد ذكي لإدارة المشاريع اسمه "تاسك برين" (Taskatek Brain).
مهمتك هي مساعدة المستخدمين في:
- توليد خطط المشاريع والمهام
- كتابة المحتوى المهني باللغة العربية
- تحليل البيانات واستخراج معلومات قيمة
- تنظيم وترتيب المهام حسب الأولوية

استخدم اللغة العربية الفصحى المبسطة وكن دقيقاً ومفيداً."""

class ChatRequest(BaseModel):
    prompt: str
    workspace_id: str
    context: Optional[dict] = None

class TaskGenerationRequest(BaseModel):
    project_description: str
    workspace_id: str

@router.post("/chat")
async def chat_with_brain(request: ChatRequest, user_id: str):
    """Chat with Taskatek Brain AI"""
    try:
        messages = [
            SystemMessage(content=ARABIC_SYSTEM_PROMPT),
            HumanMessage(content=request.prompt),
        ]
        
        response = llm(messages)
        
        # Log interaction
        # TODO: Store in brain_logs table
        
        return {
            "response": response.content,
            "tokens_used": response.response_metadata.get("token_usage", {}).get("total_tokens", 0),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الذكاء الاصطناعي | AI error: {str(e)}",
        )

@router.post("/generate-tasks")
async def generate_tasks(request: TaskGenerationRequest, user_id: str):
    """Generate project tasks using AI"""
    try:
        prompt = f"""بناءً على وصف المشروع التالي، أنشئ قائمة مهام تفصيلية بتنسيق JSON:

المشروع: {request.project_description}

أنشئ مصفوفة JSON بالمهام مع الحقول التالية:
- title_ar: عنوان المهمة بالعربية
- description_ar: وصف تفصيلي بالعربية
- priority: رقم من 1 (منخفض) إلى 4 (عاجل)
- estimated_hours: تقدير الوقت بالساعات
- dependencies: مصفوفة بأرقام المهام التي تعتمد عليها (فارغة إن لم يوجد)

مثال للتنسيق:
[
  {{
    "title_ar": "تحليل المتطلبات",
    "description_ar": "تحليل متطلبات المشروع وتوثيقها",
    "priority": 4,
    "estimated_hours": 8,
    "dependencies": []
  }}
]
"""
        
        messages = [
            SystemMessage(content=ARABIC_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        
        response = llm(messages)
        
        return {
            "message": "تم توليد المهام بنجاح | Tasks generated successfully",
            "tasks_json": response.content,
            "tokens_used": response.response_metadata.get("token_usage", {}).get("total_tokens", 0),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الذكاء الاصطناعي | AI error: {str(e)}",
        )

@router.post("/parse-voice-task")
async def parse_voice_task(transcript: str):
    """Parse task details from Arabic voice transcript"""
    try:
        prompt = f"""حلل النص التالي واستخرج تفاصيل المهمة بتنسيق JSON:

النص: "{transcript}"

استخرج:
- title_ar: عنوان المهمة
- priority: الأولوية (عاجل=4، عالية=3، متوسطة=2، منخفضة=1)
- due_date: التاريخ المطلوب (بصيغة ISO 8601 إن وُجد)
- assignee_name: اسم الشخص المكلف (إن وُجد)
- estimated_hours: تقدير الوقت بالساعات (إن وُجد)

أجب فقط بـ JSON بدون أي نص إضافي."""
        
        messages = [
            SystemMessage(content=ARABIC_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        
        response = llm(messages)
        
        return {
            "task_data": response.content,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الذكاء الاصطناعي | AI error: {str(e)}",
        )

@router.post("/summarize-meeting")
async def summarize_meeting(transcript: str):
    """Extract action items from meeting transcript"""
    try:
        prompt = f"""حلل نص الاجتماع التالي واستخرج:
1. القرارات المتخذة
2. المهام (Action Items) مع المسؤول عنها
3. النقاط المهمة

نص الاجتماع:
{transcript}

نسّق الإجابة بشكل واضح ومنظم."""
        
        messages = [
            SystemMessage(content=ARABIC_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        
        response = llm(messages)
        
        return {
            "summary": response.content,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الذكاء الاصطناعي | AI error: {str(e)}",
        )

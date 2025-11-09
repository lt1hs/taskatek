from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from supabase import create_client, Client

router = APIRouter()

supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

class AutomationCreate(BaseModel):
    workspace_id: str
    name_ar: str
    name_en: Optional[str] = None
    trigger_type: str  # task_created, status_changed, time_based, etc.
    trigger_config: Dict[str, Any]
    conditions: Optional[List[Dict[str, Any]]] = None
    actions: List[Dict[str, Any]]
    is_active: bool = True

class AutomationUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    conditions: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None

@router.post("/")
async def create_automation(automation: AutomationCreate, user_id: str):
    """Create a new automation"""
    try:
        automation_data = {
            "workspace_id": automation.workspace_id,
            "name_ar": automation.name_ar,
            "name_en": automation.name_en or automation.name_ar,
            "trigger_type": automation.trigger_type,
            "trigger_config": automation.trigger_config,
            "conditions": automation.conditions,
            "actions": automation.actions,
            "is_active": automation.is_active,
            "created_by": user_id,
        }
        
        result = supabase.table("automations").insert(automation_data).execute()
        
        return {
            "message": "تم إنشاء الأتمتة بنجاح | Automation created successfully",
            "automation": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/workspace/{workspace_id}")
async def get_workspace_automations(workspace_id: str):
    """Get all automations for a workspace"""
    try:
        automations = supabase.table("automations")\
            .select("*")\
            .eq("workspace_id", workspace_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {
            "automations": automations.data or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/templates")
async def get_automation_templates():
    """Get pre-built automation templates"""
    templates = [
        {
            "id": "whatsapp_completion",
            "name_ar": "إشعار واتساب عند الإكمال",
            "name_en": "WhatsApp notification on completion",
            "description_ar": "إرسال رسالة واتساب عند تغيير حالة المهمة إلى مكتمل",
            "trigger_type": "status_changed",
            "trigger_config": {
                "status_to": "مكتمل"
            },
            "actions": [
                {
                    "type": "send_whatsapp",
                    "config": {
                        "to": "assignee",
                        "template": "✅ تم إكمال: {task.title}"
                    }
                }
            ]
        },
        {
            "id": "weekly_report",
            "name_ar": "تقرير أسبوعي",
            "name_en": "Weekly report",
            "description_ar": "إنشاء تقرير بالمهام المكتملة كل جمعة",
            "trigger_type": "time_based",
            "trigger_config": {
                "schedule": "0 17 * * 5"  # Every Friday at 5 PM
            },
            "actions": [
                {
                    "type": "create_report",
                    "config": {
                        "report_type": "weekly_completed",
                        "send_to": "workspace_owner"
                    }
                }
            ]
        },
        {
            "id": "overdue_escalation",
            "name_ar": "تصعيد المهام المتأخرة",
            "name_en": "Overdue task escalation",
            "description_ar": "تعيين المهمة للمدير عند التأخر بيوم واحد",
            "trigger_type": "time_based",
            "trigger_config": {
                "schedule": "0 9 * * *"  # Daily at 9 AM
            },
            "conditions": [
                {
                    "field": "due_date",
                    "operator": "is_overdue_by",
                    "value": "1 day"
                },
                {
                    "field": "priority",
                    "operator": "equals",
                    "value": "high"
                }
            ],
            "actions": [
                {
                    "type": "assign_to",
                    "config": {
                        "role": "space_owner"
                    }
                },
                {
                    "type": "send_notification",
                    "config": {
                        "type": "email",
                        "to": "space_owner"
                    }
                }
            ]
        },
        {
            "id": "ai_subtasks",
            "name_ar": "توليد مهام فرعية بالذكاء الاصطناعي",
            "name_en": "AI-generated subtasks",
            "description_ar": "توليد مهام فرعية تلقائياً للمهام الكبيرة",
            "trigger_type": "task_created",
            "trigger_config": {},
            "conditions": [
                {
                    "field": "description",
                    "operator": "length_greater_than",
                    "value": 100
                }
            ],
            "actions": [
                {
                    "type": "run_ai_agent",
                    "config": {
                        "agent": "project_manager",
                        "action": "generate_subtasks"
                    }
                }
            ]
        }
    ]
    
    return {
        "templates": templates,
    }

@router.patch("/{automation_id}")
async def update_automation(automation_id: str, automation_update: AutomationUpdate):
    """Update an automation"""
    try:
        update_data = automation_update.dict(exclude_unset=True)
        
        result = supabase.table("automations")\
            .update(update_data)\
            .eq("id", automation_id)\
            .execute()
        
        return {
            "message": "تم تحديث الأتمتة بنجاح | Automation updated successfully",
            "automation": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.delete("/{automation_id}")
async def delete_automation(automation_id: str):
    """Delete an automation"""
    try:
        supabase.table("automations").delete().eq("id", automation_id).execute()
        
        return {
            "message": "تم حذف الأتمتة بنجاح | Automation deleted successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.post("/{automation_id}/toggle")
async def toggle_automation(automation_id: str):
    """Toggle automation active status"""
    try:
        # Get current status
        automation = supabase.table("automations")\
            .select("is_active")\
            .eq("id", automation_id)\
            .execute()
        
        if not automation.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="الأتمتة غير موجودة | Automation not found",
            )
        
        new_status = not automation.data[0]["is_active"]
        
        result = supabase.table("automations")\
            .update({"is_active": new_status})\
            .eq("id", automation_id)\
            .execute()
        
        return {
            "message": "تم تحديث حالة الأتمتة | Automation status updated",
            "is_active": new_status,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

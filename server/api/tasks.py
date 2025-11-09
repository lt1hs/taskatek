from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from supabase import create_client, Client
from uuid import uuid4

router = APIRouter()

supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

class TaskCreate(BaseModel):
    list_id: str
    title_ar: str
    title_en: Optional[str] = None
    description: Optional[str] = None
    status: str = "جديد"
    priority: int = 2
    due_date: Optional[str] = None
    assignees: List[str] = []
    created_via: Optional[str] = None

class TaskUpdate(BaseModel):
    title_ar: Optional[str] = None
    title_en: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[str] = None
    position: Optional[int] = None

class CommentCreate(BaseModel):
    task_id: str
    content: str
    mentions: List[str] = []

@router.post("/")
async def create_task(task: TaskCreate, user_id: str):
    """Create a new task"""
    try:
        task_id = str(uuid4())
        
        task_data = {
            "id": task_id,
            "list_id": task.list_id,
            "title_ar": task.title_ar,
            "title_en": task.title_en or task.title_ar,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "created_by": user_id,
            "created_via": task.created_via,
            "position": 0,  # TODO: Calculate actual position
        }
        
        result = supabase.table("tasks").insert(task_data).execute()
        
        # Assign to users
        if task.assignees:
            assignee_data = [
                {"task_id": task_id, "user_id": assignee_id}
                for assignee_id in task.assignees
            ]
            supabase.table("task_assignees").insert(assignee_data).execute()
        
        return {
            "message": "تم إنشاء المهمة بنجاح | Task created successfully",
            "task": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/{task_id}")
async def get_task(task_id: str):
    """Get task by ID"""
    try:
        task = supabase.table("tasks")\
            .select("*, task_assignees(user_id)")\
            .eq("id", task_id)\
            .execute()
        
        if not task.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="المهمة غير موجودة | Task not found",
            )
        
        # Get comments
        comments = supabase.table("comments")\
            .select("*, profiles(full_name_ar, avatar_url)")\
            .eq("task_id", task_id)\
            .order("created_at")\
            .execute()
        
        return {
            "task": task.data[0],
            "comments": comments.data or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.patch("/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update task"""
    try:
        update_data = task_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("tasks")\
            .update(update_data)\
            .eq("id", task_id)\
            .execute()
        
        return {
            "message": "تم تحديث المهمة بنجاح | Task updated successfully",
            "task": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Delete task"""
    try:
        supabase.table("tasks").delete().eq("id", task_id).execute()
        
        return {
            "message": "تم حذف المهمة بنجاح | Task deleted successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.post("/comments")
async def create_comment(comment: CommentCreate, user_id: str):
    """Add comment to task"""
    try:
        comment_data = {
            "task_id": comment.task_id,
            "user_id": user_id,
            "content": comment.content,
            "mentions": comment.mentions,
        }
        
        result = supabase.table("comments").insert(comment_data).execute()
        
        return {
            "message": "تم إضافة التعليق بنجاح | Comment added successfully",
            "comment": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/list/{list_id}")
async def get_list_tasks(list_id: str):
    """Get all tasks in a list"""
    try:
        tasks = supabase.table("tasks")\
            .select("*, task_assignees(user_id)")\
            .eq("list_id", list_id)\
            .order("position")\
            .execute()
        
        return {
            "tasks": tasks.data or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import os
from supabase import create_client, Client
from uuid import uuid4

router = APIRouter()

supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

class WorkspaceCreate(BaseModel):
    name_ar: str
    name_en: Optional[str] = None
    settings: Optional[dict] = None

class SpaceCreate(BaseModel):
    workspace_id: str
    name_ar: str
    name_en: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

@router.post("/")
async def create_workspace(workspace: WorkspaceCreate, user_id: str):
    """Create a new workspace"""
    try:
        workspace_id = str(uuid4())
        
        # Create workspace
        workspace_data = {
            "id": workspace_id,
            "name_ar": workspace.name_ar,
            "name_en": workspace.name_en or workspace.name_ar,
            "owner_id": user_id,
            "settings": workspace.settings or {
                "language": "ar",
                "timezone": "Asia/Riyadh",
            },
        }
        
        result = supabase.table("workspaces").insert(workspace_data).execute()
        
        # Add user as owner
        member_data = {
            "workspace_id": workspace_id,
            "user_id": user_id,
            "role": "owner",
        }
        supabase.table("workspace_members").insert(member_data).execute()
        
        # Create default space
        default_space = {
            "workspace_id": workspace_id,
            "name_ar": "المهام العامة",
            "name_en": "General Tasks",
            "status": "active",
            "position": 0,
        }
        space_result = supabase.table("spaces").insert(default_space).execute()
        
        # Create default inbox list
        if space_result.data:
            inbox_list = {
                "space_id": space_result.data[0]["id"],
                "name_ar": "صندوق الوارد",
                "name_en": "Inbox",
                "view_type": "list",
                "position": 0,
            }
            supabase.table("lists").insert(inbox_list).execute()
        
        return {
            "message": "تم إنشاء مساحة العمل بنجاح | Workspace created successfully",
            "workspace": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str, user_id: str):
    """Get workspace details"""
    try:
        # Check if user is a member
        member_check = supabase.table("workspace_members")\
            .select("*")\
            .eq("workspace_id", workspace_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not member_check.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية الوصول | Access denied",
            )
        
        # Get workspace
        workspace = supabase.table("workspaces")\
            .select("*")\
            .eq("id", workspace_id)\
            .execute()
        
        # Get spaces
        spaces = supabase.table("spaces")\
            .select("*")\
            .eq("workspace_id", workspace_id)\
            .order("position")\
            .execute()
        
        return {
            "workspace": workspace.data[0] if workspace.data else None,
            "spaces": spaces.data or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.post("/spaces")
async def create_space(space: SpaceCreate):
    """Create a new space in workspace"""
    try:
        space_data = {
            "workspace_id": space.workspace_id,
            "name_ar": space.name_ar,
            "name_en": space.name_en or space.name_ar,
            "icon": space.icon,
            "color": space.color,
            "status": "active",
            "position": 0,  # TODO: Calculate actual position
        }
        
        result = supabase.table("spaces").insert(space_data).execute()
        
        return {
            "message": "تم إنشاء المساحة بنجاح | Space created successfully",
            "space": result.data[0] if result.data else None,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.get("/spaces/{space_id}/lists")
async def get_space_lists(space_id: str):
    """Get all lists in a space"""
    try:
        lists = supabase.table("lists")\
            .select("*")\
            .eq("space_id", space_id)\
            .order("position")\
            .execute()
        
        return {
            "lists": lists.data or [],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

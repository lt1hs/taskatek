from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
from supabase import create_client, Client

router = APIRouter()

# Supabase client
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name_ar: str
    full_name_en: Optional[str] = None
    lang_preference: str = "ar"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    code: str

@router.post("/register")
async def register(user: UserRegister):
    """Register new user with email and password"""
    try:
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        
        if auth_response.user:
            # Create user profile
            profile_data = {
                "id": auth_response.user.id,
                "email": user.email,
                "full_name_ar": user.full_name_ar,
                "full_name_en": user.full_name_en,
                "lang_preference": user.lang_preference,
            }
            
            supabase.table("profiles").insert(profile_data).execute()
            
            return {
                "message": "تم إنشاء الحساب بنجاح | Account created successfully",
                "user": auth_response.user,
                "session": auth_response.session,
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="فشل إنشاء الحساب | Registration failed",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.post("/login")
async def login(credentials: UserLogin):
    """Login with email and password"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        
        if auth_response.user:
            return {
                "message": "تم تسجيل الدخول بنجاح | Login successful",
                "user": auth_response.user,
                "session": auth_response.session,
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="بيانات الدخول غير صحيحة | Invalid credentials",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

@router.post("/whatsapp/request-otp")
async def request_whatsapp_otp(data: OTPRequest):
    """Request WhatsApp OTP for phone number"""
    # TODO: Implement WhatsApp OTP sending logic
    # This will integrate with WhatsApp Business API
    return {
        "message": "تم إرسال رمز التحقق | OTP sent",
        "phone": data.phone,
    }

@router.post("/whatsapp/verify-otp")
async def verify_whatsapp_otp(data: OTPVerify):
    """Verify WhatsApp OTP"""
    # TODO: Implement OTP verification logic
    return {
        "message": "تم التحقق بنجاح | Verification successful",
        "phone": data.phone,
    }

@router.post("/logout")
async def logout():
    """Logout current user"""
    try:
        supabase.auth.sign_out()
        return {"message": "تم تسجيل الخروج بنجاح | Logout successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في الخادم | Server error: {str(e)}",
        )

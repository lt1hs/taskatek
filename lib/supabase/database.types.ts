export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name_ar: string | null;
          full_name_en: string | null;
          email: string;
          avatar_url: string | null;
          lang_preference: 'ar' | 'en';
          notification_settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name_ar?: string | null;
          full_name_en?: string | null;
          email: string;
          avatar_url?: string | null;
          lang_preference?: 'ar' | 'en';
          notification_settings?: Json | null;
        };
        Update: {
          full_name_ar?: string | null;
          full_name_en?: string | null;
          avatar_url?: string | null;
          lang_preference?: 'ar' | 'en';
          notification_settings?: Json | null;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string | null;
          owner_id: string;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_ar: string;
          name_en?: string | null;
          owner_id: string;
          settings?: Json | null;
        };
        Update: {
          name_ar?: string;
          name_en?: string | null;
          settings?: Json | null;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'guest';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member' | 'guest';
        };
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'guest';
        };
      };
      spaces: {
        Row: {
          id: string;
          workspace_id: string;
          name_ar: string;
          name_en: string | null;
          icon: string | null;
          color: string | null;
          status: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name_ar: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
          status?: string;
          position?: number;
        };
        Update: {
          name_ar?: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
          status?: string;
          position?: number;
        };
      };
      folders: {
        Row: {
          id: string;
          space_id: string;
          name_ar: string;
          name_en: string | null;
          position: number;
          is_collapsed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          name_ar: string;
          name_en?: string | null;
          position?: number;
          is_collapsed?: boolean;
        };
        Update: {
          name_ar?: string;
          name_en?: string | null;
          position?: number;
          is_collapsed?: boolean;
        };
      };
      lists: {
        Row: {
          id: string;
          folder_id: string | null;
          space_id: string;
          name_ar: string;
          name_en: string | null;
          view_type: string;
          custom_fields: Json | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          folder_id?: string | null;
          space_id: string;
          name_ar: string;
          name_en?: string | null;
          view_type?: string;
          custom_fields?: Json | null;
          position?: number;
        };
        Update: {
          name_ar?: string;
          name_en?: string | null;
          view_type?: string;
          custom_fields?: Json | null;
          position?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          list_id: string;
          title_ar: string;
          title_en: string | null;
          description: string | null;
          status: string;
          priority: number;
          due_date: string | null;
          start_date: string | null;
          time_estimate_seconds: number | null;
          time_tracked_seconds: number;
          custom_fields: Json | null;
          position: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          created_via: string | null;
        };
        Insert: {
          id?: string;
          list_id: string;
          title_ar: string;
          title_en?: string | null;
          description?: string | null;
          status?: string;
          priority?: number;
          due_date?: string | null;
          start_date?: string | null;
          time_estimate_seconds?: number | null;
          time_tracked_seconds?: number;
          custom_fields?: Json | null;
          position?: number;
          created_by: string;
          created_via?: string | null;
        };
        Update: {
          title_ar?: string;
          title_en?: string | null;
          description?: string | null;
          status?: string;
          priority?: number;
          due_date?: string | null;
          start_date?: string | null;
          time_estimate_seconds?: number | null;
          time_tracked_seconds?: number;
          custom_fields?: Json | null;
          position?: number;
        };
      };
      task_assignees: {
        Row: {
          task_id: string;
          user_id: string;
          assigned_at: string;
        };
        Insert: {
          task_id: string;
          user_id: string;
        };
        Update: {};
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          mentions: string[];
          parent_comment_id: string | null;
          is_resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          mentions?: string[];
          parent_comment_id?: string | null;
          is_resolved?: boolean;
        };
        Update: {
          content?: string;
          is_resolved?: boolean;
        };
      };
      attachments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type: string;
        };
        Update: {};
      };
      brain_logs: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          prompt: string;
          response: string;
          agent_type: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          prompt: string;
          response: string;
          agent_type: string;
          tokens_used?: number | null;
        };
        Update: {};
      };
      automations: {
        Row: {
          id: string;
          workspace_id: string;
          name_ar: string;
          name_en: string | null;
          trigger_type: string;
          trigger_config: Json;
          conditions: Json | null;
          actions: Json;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name_ar: string;
          name_en?: string | null;
          trigger_type: string;
          trigger_config: Json;
          conditions?: Json | null;
          actions: Json;
          is_active?: boolean;
          created_by: string;
        };
        Update: {
          name_ar?: string;
          name_en?: string | null;
          trigger_config?: Json;
          conditions?: Json | null;
          actions?: Json;
          is_active?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

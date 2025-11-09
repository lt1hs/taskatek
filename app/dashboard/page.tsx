'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Brain, LayoutGrid, Plus, Settings, LogOut, Search, Bell } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchWorkspaces();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get workspaces where user is a member
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const workspaceIds = memberData.map(m => m.workspace_id);
        const { data: workspacesData } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds);

        setWorkspaces(workspacesData || []);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const createWorkspace = () => {
    router.push('/workspace/create');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold">تاسكاتك</span>
              </div>
              
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="ابحث في المهام..."
                    className="w-96 pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 left-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="h-6 w-6" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.user_metadata?.full_name_ar || 'مستخدم'}</h1>
          <p className="text-gray-600 dark:text-gray-400">اختر مساحة عمل للبدء</p>
        </div>

        {/* Workspaces Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Workspace Card */}
          <button
            onClick={createWorkspace}
            className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex flex-col items-center justify-center gap-4 min-h-[200px]"
          >
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">إنشاء مساحة عمل جديدة</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">ابدأ مشروعاً جديداً</p>
            </div>
          </button>

          {/* Existing Workspaces */}
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => router.push(`/workspace/${workspace.id}`)}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="h-6 w-6 text-white" />
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-xl mb-2">{workspace.name_ar}</h3>
              {workspace.name_en && (
                <p className="text-sm text-gray-500 mb-4" dir="ltr">{workspace.name_en}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>0 مساحات</span>
                <span>•</span>
                <span>0 مهام</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">ليس لديك مساحات عمل بعد</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              أنشئ مساحة عملك الأولى للبدء في إدارة مشاريعك
            </p>
            <button
              onClick={createWorkspace}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إنشاء مساحة عمل
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {workspaces.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">إجراءات سريعة</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">تاسك برين</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  استخدم الذكاء الاصطناعي لتوليد المهام والخطط
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">إنشاء مهمة سريعة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  أضف مهمة جديدة بسرعة إلى صندوق الوارد
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <LayoutGrid className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">عرض كل المهام</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  اطلع على جميع مهامك عبر كل المساحات
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

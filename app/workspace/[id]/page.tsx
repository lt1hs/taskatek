'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Brain, 
  Plus, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  LayoutGrid,
  List,
  Calendar,
  BarChart,
  Menu,
  X
} from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];
type TaskList = Database['public']['Tables']['lists']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchWorkspaceData();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedSpace) {
      fetchLists(selectedSpace);
    }
  }, [selectedSpace]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
  };

  const fetchWorkspaceData = async () => {
    try {
      // Fetch workspace
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (workspaceData) {
        setWorkspace(workspaceData);
      }

      // Fetch spaces
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('position');

      if (spacesData && spacesData.length > 0) {
        setSpaces(spacesData);
        setSelectedSpace(spacesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLists = async (spaceId: string) => {
    try {
      const { data: listsData } = await supabase
        .from('lists')
        .select('*')
        .eq('space_id', spaceId)
        .order('position');

      if (listsData) {
        setLists(listsData);
        if (listsData.length > 0) {
          fetchTasks(listsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchTasks = async (listId: string) => {
    try {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('list_id', listId)
        .order('position');

      if (tasksData) {
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">مساحة العمل غير موجودة</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4">
          {/* Workspace Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg truncate">{workspace.name_ar}</h2>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Spaces */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">المساحات</h3>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => setSelectedSpace(space.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                    selectedSpace === space.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-sm">{space.name_ar}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              تاسك برين
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
            >
              <LayoutGrid className="h-4 w-4" />
              مساحات العمل
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold">تاسكاتك</span>
                </div>

                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="search"
                      placeholder="ابحث في المهام..."
                      className="w-80 pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* View Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex gap-6">
            <button className="px-3 py-3 border-b-2 border-blue-600 text-blue-600 font-medium flex items-center gap-2">
              <List className="h-4 w-4" />
              قائمة
            </button>
            <button className="px-3 py-3 border-b-2 border-transparent hover:text-blue-600 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              لوحة
            </button>
            <button className="px-3 py-3 border-b-2 border-transparent hover:text-blue-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              تقويم
            </button>
            <button className="px-3 py-3 border-b-2 border-transparent hover:text-blue-600 flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              جانت
            </button>
          </div>
        </div>

        {/* Tasks Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {lists.length > 0 ? lists[0].name_ar : 'المهام'}
              </h1>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                مهمة جديدة
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد مهام بعد</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ابدأ بإضافة مهمة جديدة أو استخدم تاسك برين لتوليد المهام تلقائياً
                  </p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    إضافة مهمة
                  </button>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium">{task.title_ar}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

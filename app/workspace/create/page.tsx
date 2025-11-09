'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Brain, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const INDUSTRY_OPTIONS = [
  { value: 'marketing', label_ar: 'تسويق', label_en: 'Marketing' },
  { value: 'development', label_ar: 'تطوير برمجيات', label_en: 'Software Development' },
  { value: 'design', label_ar: 'تصميم', label_en: 'Design' },
  { value: 'sales', label_ar: 'مبيعات', label_en: 'Sales' },
  { value: 'operations', label_ar: 'عمليات', label_en: 'Operations' },
  { value: 'other', label_ar: 'أخرى', label_en: 'Other' },
];

const TEMPLATES = [
  { id: 'blank', name_ar: 'فارغ', name_en: 'Blank', description_ar: 'ابدأ من الصفر' },
  { id: 'marketing', name_ar: 'تسويق', name_en: 'Marketing', description_ar: 'مشروع حملة تسويقية' },
  { id: 'development', name_ar: 'تطوير', name_en: 'Development', description_ar: 'مشروع تطوير برمجيات' },
  { id: 'project', name_ar: 'إدارة مشروع', name_en: 'Project Management', description_ar: 'مشروع عام' },
];

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    industry: '',
    template: 'blank',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مصرح');

      // Create workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name_ar: formData.nameAr,
          name_en: formData.nameEn || formData.nameAr,
          owner_id: user.id,
          settings: {
            language: 'ar',
            timezone: 'Asia/Riyadh',
            industry: formData.industry,
          },
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as workspace owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user.id,
          role: 'owner',
        });

      // Create default space
      const { data: spaceData } = await supabase
        .from('spaces')
        .insert({
          workspace_id: workspaceData.id,
          name_ar: 'المهام العامة',
          name_en: 'General Tasks',
          status: 'active',
          position: 0,
        })
        .select()
        .single();

      // Create inbox list
      if (spaceData) {
        await supabase
          .from('lists')
          .insert({
            space_id: spaceData.id,
            name_ar: 'صندوق الوارد',
            name_en: 'Inbox',
            view_type: 'list',
            position: 0,
          });
      }

      // Redirect to workspace
      router.push(`/workspace/${workspaceData.id}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء مساحة العمل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold">تاسكاتك</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">إنشاء مساحة عمل جديدة</h1>
          <p className="text-gray-600 dark:text-gray-400">
            ابدأ رحلتك في إدارة المشاريع بذكاء
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workspace Name (Arabic) */}
            <div>
              <label htmlFor="nameAr" className="block text-sm font-medium mb-2">
                اسم مساحة العمل (عربي) *
              </label>
              <input
                id="nameAr"
                type="text"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="مثال: شركة ABC"
              />
            </div>

            {/* Workspace Name (English) */}
            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-2">
                اسم مساحة العمل (إنجليزي)
              </label>
              <input
                id="nameEn"
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Example: ABC Company"
                dir="ltr"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium mb-2">
                المجال
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">اختر المجال</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                اختر قالباً للبدء
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`p-4 border-2 rounded-lg text-right transition-all ${
                      formData.template === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold">{template.name_ar}</h4>
                      {formData.template === template.id && (
                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description_ar}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assistance Hint */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">💡 نصيحة: استخدم تاسك برين</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    بعد إنشاء مساحة العمل، يمكنك استخدام المساعد الذكي لتوليد المهام والمساحات تلقائياً
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.nameAr}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جارٍ الإنشاء...
                  </>
                ) : (
                  <>
                    إنشاء مساحة العمل
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

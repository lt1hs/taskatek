'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { X, Calendar, User, Tag, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskModalProps {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export function TaskModal({ listId, isOpen, onClose, onTaskCreated }: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    description: '',
    priority: 2,
    dueDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مصرح');

      const { error } = await supabase.from('tasks').insert({
        list_id: listId,
        title_ar: formData.titleAr,
        title_en: formData.titleEn || formData.titleAr,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.dueDate || null,
        created_by: user.id,
        status: 'جديد',
        position: 0,
      });

      if (error) throw error;

      onTaskCreated?.();
      onClose();
      setFormData({ titleAr: '', titleEn: '', description: '', priority: 2, dueDate: '' });
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose} dir="rtl">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">إنشاء مهمة جديدة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title (Arabic) */}
          <div>
            <label htmlFor="titleAr" className="block text-sm font-medium mb-2">
              عنوان المهمة (عربي) *
            </label>
            <Input
              id="titleAr"
              type="text"
              required
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              placeholder="مثال: تصميم الشعار"
              className="text-lg"
            />
          </div>

          {/* Title (English) */}
          <div>
            <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
              عنوان المهمة (إنجليزي)
            </label>
            <Input
              id="titleEn"
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder="Example: Design Logo"
              dir="ltr"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              الوصف
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="أضف وصفاً تفصيلياً للمهمة..."
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-2">
              الأولوية
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>منخفضة</option>
              <option value={2}>متوسطة</option>
              <option value={3}>عالية</option>
              <option value={4}>عاجلة</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
              <Calendar className="inline h-4 w-4 ml-1" />
              تاريخ الاستحقاق
            </label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.titleAr}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جارٍ الإنشاء...
                </>
              ) : (
                'إنشاء المهمة'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

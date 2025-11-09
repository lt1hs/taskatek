import Link from 'next/link';
import { ArrowLeft, Brain, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">تاسكاتك</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          إدارة المشاريع بذكاء اصطناعي
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          تاسكاتك - منصة إدارة المشاريع الأولى بالعربية مع مساعد ذكي متكامل
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ابدأ الآن
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg rounded-lg hover:bg-blue-50 transition-colors"
          >
            اكتشف المزايا
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">المزايا الرئيسية</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🤖"
            title="تاسك برين - المساعد الذكي"
            description="مساعد ذكي بالعربية يساعدك في توليد المهام، كتابة المحتوى، وتنظيم المشاريع"
          />
          <FeatureCard
            icon="📊"
            title="15+ طريقة عرض"
            description="قوائم، كانبان، تقويم، جانت، خريطة ذهنية، وأكثر"
          />
          <FeatureCard
            icon="⚡"
            title="أتمتة ذكية"
            description="أتمتة المهام والإشعارات بدون برمجة مع قوالب جاهزة"
          />
          <FeatureCard
            icon="💬"
            title="تكامل واتساب"
            description="إنشاء المهام وإرسال الإشعارات عبر واتساب مباشرة"
          />
          <FeatureCard
            icon="🎯"
            title="تعاون فوري"
            description="تعديل المهام، التعليقات، والإشعارات الفورية لفريقك"
          />
          <FeatureCard
            icon="🌍"
            title="دعم كامل للعربية"
            description="واجهة بالعربية من الأساس مع دعم الإنجليزية"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">جرب تاسكاتك مجاناً اليوم</h2>
          <p className="text-xl mb-8">ابدأ الآن واكتشف قوة الذكاء الاصطناعي في إدارة مشاريعك</p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition-colors"
          >
            إنشاء حساب مجاني
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">تاسكاتك</span>
          </div>
          <p className="text-gray-400">© 2024 Taskatek. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

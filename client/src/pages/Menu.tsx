import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Shield } from "lucide-react";

export default function Menu() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc4 100%)",
      }}
    >
      {/* Sacred geometry background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="golden-ratio" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#d4af37" strokeWidth="1" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="#d4af37" strokeWidth="1" />
              <path d="M 100 20 L 100 180 M 20 100 L 180 100" stroke="#d4af37" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#golden-ratio)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <h1
          className="text-4xl md:text-6xl font-bold text-center mb-12"
          style={{
            fontFamily: "'Tajawal', sans-serif",
            color: "#1a2332",
          }}
        >
          اختر نوع الحساب
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Parent Button */}
          <button
            onClick={() => setLocation("/login/parent")}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
              border: "2px solid #d4af37",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)" }}
              >
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#1a2332",
                }}
              >
                ولي امر
              </h2>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                عرض بيانات الطالب والمشتريات
              </p>
            </div>
          </button>

          {/* Teacher Button */}
          <button
            onClick={() => setLocation("/login/teacher")}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
              border: "2px solid #d4af37",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "linear-gradient(135deg, #50c878 0%, #3da35d 100%)" }}
              >
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#1a2332",
                }}
              >
                مدرس
              </h2>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                منح المكافآت للطلاب
              </p>
            </div>
          </button>

          {/* Principal Button */}
          <button
            onClick={() => setLocation("/login/principal")}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
              border: "2px solid #d4af37",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" }}
              >
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#1a2332",
                }}
              >
                مدير
              </h2>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                إدارة النقاط والمشتريات
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

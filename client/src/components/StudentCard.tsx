import { Star, Shield } from "lucide-react";
import type { Student } from "@shared/types";

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
        minHeight: "280px",
      }}
    >
      {/* Decorative stars */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
        <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
      </div>

      {/* Shield logo */}
      <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Shield className="w-16 h-16 text-white" />
      </div>

      {/* Card content */}
      <div className="relative mt-20">
        <div className="mb-6">
          <h2
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {student.nameAr}
          </h2>
          <p className="text-white/80 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {student.nameEn}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-white/70 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              الصف
            </p>
            <p className="text-white text-xl font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {student.grade}
            </p>
          </div>
          <div>
            <p className="text-white/70 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              الشعبة
            </p>
            <p className="text-white text-xl font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {student.section}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="text-white/80 text-sm mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            نقاط الفلاح
          </p>
          <p className="text-yellow-300 text-4xl font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {student.points}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-white/60 text-xs text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {student.school}
          </p>
        </div>
      </div>
    </div>
  );
}

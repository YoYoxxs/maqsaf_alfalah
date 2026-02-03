import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useSchoolAuth } from "@/contexts/SchoolAuthContext";
import { toast } from "sonner";
import { Fingerprint } from "lucide-react";
import type { UserRole } from "@shared/types";

export default function Login() {
  const params = useParams();
  const role = params.role as UserRole;
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const { login } = useSchoolAuth();

  const loginMutation = trpc.schoolAuth.login.useMutation({
    onSuccess: (data) => {
      login(data.user);
      toast.success("تم تسجيل الدخول بنجاح");
      
      // Navigate based on role
      if (role === "parent") {
        setLocation("/parent/dashboard");
      } else if (role === "teacher") {
        setLocation("/teacher/dashboard");
      } else if (role === "principal") {
        setLocation("/principal/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setShowFingerprint(false);
      setProgress(0);
    },
  });

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setShowFingerprint(true);
    }
  };

  const handleFingerprintHold = () => {
    setIsHolding(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        // Submit login
        loginMutation.mutate({ username, role });
      }
    }, 30);

    // Store interval ID to clear on mouse up
    (window as any).fingerprintInterval = interval;
  };

  const handleFingerprintRelease = () => {
    setIsHolding(false);
    if ((window as any).fingerprintInterval) {
      clearInterval((window as any).fingerprintInterval);
    }
    setProgress(0);
  };

  const getRoleTitle = () => {
    switch (role) {
      case "parent":
        return "ولي امر";
      case "teacher":
        return "مدرس";
      case "principal":
        return "مدير";
      default:
        return "";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc4 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
            border: "2px solid #d4af37",
          }}
        >
          <h1
            className="text-3xl font-bold text-center mb-2"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            تسجيل الدخول
          </h1>
          <p
            className="text-center mb-8 text-lg"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#d4af37",
            }}
          >
            {getRoleTitle()}
          </p>

          {!showFingerprint ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: "'Tajawal', sans-serif",
                    color: "#1a2332",
                  }}
                >
                  اسم المستخدم
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="text-right"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6"
                style={{
                  background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                التالي
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p
                className="text-center text-sm"
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#1a2332",
                }}
              >
                اضغط مع الاستمرار على البصمة للمتابعة
              </p>

              <div className="relative">
                <button
                  onMouseDown={handleFingerprintHold}
                  onMouseUp={handleFingerprintRelease}
                  onMouseLeave={handleFingerprintRelease}
                  onTouchStart={handleFingerprintHold}
                  onTouchEnd={handleFingerprintRelease}
                  className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isHolding
                      ? "linear-gradient(135deg, #50c878 0%, #3da35d 100%)"
                      : "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
                    boxShadow: isHolding ? "0 0 30px rgba(80, 200, 120, 0.5)" : "0 0 20px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Fingerprint className="w-16 h-16 text-white" />
                  
                  {/* Progress circle */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowFingerprint(false);
                  setProgress(0);
                }}
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                رجوع
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

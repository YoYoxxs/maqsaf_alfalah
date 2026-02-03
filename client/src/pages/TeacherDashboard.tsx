import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSchoolAuth } from "@/contexts/SchoolAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Award, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useSchoolAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardReason, setRewardReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "teacher") {
      setLocation("/menu");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: students, isLoading } = trpc.students.getAll.useQuery();

  const updatePointsMutation = trpc.students.updatePoints.useMutation({
    onSuccess: () => {
      toast.success("تم منح المكافأة بنجاح");
      utils.students.getAll.invalidate();
      setDialogOpen(false);
      setRewardAmount("");
      setRewardReason("");
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/menu");
  };

  const handleGiveReward = (studentId: number) => {
    setSelectedStudent(studentId);
    setDialogOpen(true);
  };

  const handleSubmitReward = () => {
    if (!selectedStudent || !rewardAmount || !rewardReason) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    const amount = parseInt(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("الرجاء إدخال رقم صحيح");
      return;
    }

    updatePointsMutation.mutate({
      studentId: selectedStudent,
      amount: amount,
      reason: rewardReason,
      actionBy: user?.username || "",
      actionByRole: "teacher",
    });
  };

  const filteredStudents = students?.filter((student) =>
    student.nameAr.includes(searchTerm) || student.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc4 100%)",
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            لوحة المدرس
          </h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
        <p
          className="mt-2 text-lg"
          style={{
            fontFamily: "'Tajawal', sans-serif",
            color: "#d4af37",
          }}
        >
          مرحباً {user.username}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            />
          </div>
        </div>

        {/* Students List */}
        <div
          className="rounded-2xl p-6 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
            border: "2px solid #d4af37",
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            قائمة الطلاب
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
              ))}
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-lg flex justify-between items-center"
                  style={{
                    background: "#f8f6f0",
                    border: "1px solid #e0d5b7",
                  }}
                >
                  <div className="flex-1">
                    <h3
                      className="font-bold text-lg"
                      style={{
                        fontFamily: "'Tajawal', sans-serif",
                        color: "#1a2332",
                      }}
                    >
                      {student.nameAr}
                    </h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      الصف {student.grade} - الشعبة {student.section}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: "'Tajawal', sans-serif",
                          color: "#d4af37",
                        }}
                      >
                        {student.points}
                      </p>
                      <p className="text-xs text-gray-600" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        نقطة
                      </p>
                    </div>
                    <Button
                      onClick={() => handleGiveReward(student.id)}
                      style={{
                        background: "linear-gradient(135deg, #50c878 0%, #3da35d 100%)",
                        fontFamily: "'Tajawal', sans-serif",
                      }}
                    >
                      <Award className="ml-2 h-4 w-4" />
                      منح مكافأة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              لا توجد نتائج
            </p>
          )}
        </div>
      </div>

      {/* Reward Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Tajawal', sans-serif", textAlign: "right" }}>
              منح مكافأة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                عدد النقاط
              </label>
              <Input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="أدخل عدد النقاط"
                className="text-right"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
                min="1"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                السبب
              </label>
              <Input
                type="text"
                value={rewardReason}
                onChange={(e) => setRewardReason(e.target.value)}
                placeholder="مثال: تفوق في الامتحان"
                className="text-right"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              />
            </div>
            <Button
              onClick={handleSubmitReward}
              className="w-full"
              disabled={updatePointsMutation.isPending}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {updatePointsMutation.isPending ? "جاري المنح..." : "منح المكافأة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSchoolAuth } from "@/contexts/SchoolAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Minus, Search, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function PrincipalDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useSchoolAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "remove">("add");

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "principal") {
      setLocation("/menu");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: students, isLoading: studentsLoading } = trpc.students.getAll.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.getAll.useQuery();

  const updatePointsMutation = trpc.students.updatePoints.useMutation({
    onSuccess: () => {
      toast.success(actionType === "add" ? "تم إضافة النقاط بنجاح" : "تم خصم النقاط بنجاح");
      utils.students.getAll.invalidate();
      setDialogOpen(false);
      setPointsAmount("");
      setPointsReason("");
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

  const handleManagePoints = (studentId: number, type: "add" | "remove") => {
    setSelectedStudent(studentId);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleSubmitPoints = () => {
    if (!selectedStudent || !pointsAmount || !pointsReason) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("الرجاء إدخال رقم صحيح");
      return;
    }

    updatePointsMutation.mutate({
      studentId: selectedStudent,
      amount: actionType === "add" ? amount : -amount,
      reason: pointsReason,
      actionBy: user?.username || "",
      actionByRole: "principal",
    });
  };

  const filteredStudents = students?.filter((student) =>
    student.nameAr.includes(searchTerm) || student.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get student name by ID
  const getStudentName = (studentId: number) => {
    const student = students?.find((s) => s.id === studentId);
    return student?.nameAr || "غير معروف";
  };

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
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            لوحة المدير
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

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              إدارة الطلاب
            </TabsTrigger>
            <TabsTrigger value="transactions" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              سجل المشتريات
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
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
              {studentsLoading ? (
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleManagePoints(student.id, "add")}
                            size="sm"
                            style={{
                              background: "linear-gradient(135deg, #50c878 0%, #3da35d 100%)",
                              fontFamily: "'Tajawal', sans-serif",
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleManagePoints(student.id, "remove")}
                            size="sm"
                            style={{
                              background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                              fontFamily: "'Tajawal', sans-serif",
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
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
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
                border: "2px solid #d4af37",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6 flex items-center gap-2"
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#1a2332",
                }}
              >
                <Receipt className="w-6 h-6" />
                سجل جميع المشتريات
              </h2>

              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg border-r-4"
                      style={{
                        background: "#f8f6f0",
                        borderColor: "#d4af37",
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3
                            className="font-bold"
                            style={{
                              fontFamily: "'Tajawal', sans-serif",
                              color: "#1a2332",
                            }}
                          >
                            {getStudentName(transaction.studentId)}
                          </h3>
                          <p
                            className="text-lg font-semibold"
                            style={{
                              fontFamily: "'Tajawal', sans-serif",
                              color: "#4a90e2",
                            }}
                          >
                            {transaction.itemName}
                          </p>
                          <p className="text-sm text-gray-600" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                            {transaction.itemNameEn}
                          </p>
                        </div>
                        <div className="text-left">
                          <p
                            className="font-bold text-xl"
                            style={{
                              fontFamily: "'Tajawal', sans-serif",
                              color: "#e74c3c",
                            }}
                          >
                            -{transaction.pointsSpent}
                          </p>
                          <p className="text-xs" style={{ fontFamily: "'Tajawal', sans-serif", color: "#d4af37" }}>
                            نقطة
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {format(new Date(transaction.transactionDate), "PPp", { locale: ar })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  لا توجد مشتريات حتى الآن
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Points Management Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Tajawal', sans-serif", textAlign: "right" }}>
              {actionType === "add" ? "إضافة نقاط" : "خصم نقاط"}
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
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
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
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder={actionType === "add" ? "مثال: مكافأة" : "مثال: مخالفة"}
                className="text-right"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              />
            </div>
            <Button
              onClick={handleSubmitPoints}
              className="w-full"
              disabled={updatePointsMutation.isPending}
              style={{
                background:
                  actionType === "add"
                    ? "linear-gradient(135deg, #50c878 0%, #3da35d 100%)"
                    : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {updatePointsMutation.isPending
                ? "جاري التنفيذ..."
                : actionType === "add"
                  ? "إضافة النقاط"
                  : "خصم النقاط"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

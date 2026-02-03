import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSchoolAuth } from "@/contexts/SchoolAuthContext";
import { trpc } from "@/lib/trpc";
import StudentCard from "@/components/StudentCard";
import { Button } from "@/components/ui/button";
import { LogOut, Receipt } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function ParentDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useSchoolAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "parent") {
      setLocation("/menu");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: student, isLoading: studentLoading } = trpc.students.getById.useQuery(
    { id: user?.studentId || 0 },
    { enabled: !!user?.studentId }
  );

  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.getByStudentId.useQuery(
    { studentId: user?.studentId || 0 },
    { enabled: !!user?.studentId }
  );

  const handleLogout = () => {
    logout();
    setLocation("/menu");
  };

  if (!user || !student) {
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
            لوحة ولي الأمر
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

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Student Card */}
        <div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            بطاقة الطالب
          </h2>
          {studentLoading ? (
            <div className="animate-pulse bg-white/50 rounded-3xl h-80"></div>
          ) : (
            student && <StudentCard student={student} />
          )}
        </div>

        {/* Purchase History */}
        <div>
          <h2
            className="text-2xl font-bold mb-4 flex items-center gap-2"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              color: "#1a2332",
            }}
          >
            <Receipt className="w-6 h-6" />
            سجل المشتريات
          </h2>
          <div
            className="rounded-2xl p-6 shadow-lg max-h-[500px] overflow-y-auto"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)",
              border: "2px solid #d4af37",
            }}
          >
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
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
                          className="font-bold text-lg"
                          style={{
                            fontFamily: "'Tajawal', sans-serif",
                            color: "#1a2332",
                          }}
                        >
                          {transaction.itemName}
                        </h3>
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
        </div>
      </div>
    </div>
  );
}

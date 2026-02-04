import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSchoolAuth } from "@/contexts/SchoolAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Plus, Minus, Search, Receipt, Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  
  // Student management states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    nameAr: "",
    nameEn: "",
    parentName: "",
    grade: 1,
    section: "",
    school: "مدرسة الفلاح",
    points: 20,
  });

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

  const createStudentMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الطالب بنجاح");
      utils.students.getAll.invalidate();
      setAddDialogOpen(false);
      setNewStudent({
        nameAr: "",
        nameEn: "",
        parentName: "",
        grade: 1,
        section: "",
        school: "مدرسة الفلاح",
        points: 20,
      });
    },
    onError: (error) => {
      toast.error("فشل إضافة الطالب: " + error.message);
    },
  });

  const updateStudentMutation = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الطالب بنجاح");
      utils.students.getAll.invalidate();
      setEditDialogOpen(false);
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error("فشل تحديث البيانات: " + error.message);
    },
  });

  const deleteStudentMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الطالب بنجاح");
      utils.students.getAll.invalidate();
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    },
    onError: (error) => {
      toast.error("فشل حذف الطالب: " + error.message);
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

  const handleAddStudent = () => {
    if (!newStudent.nameAr || !newStudent.parentName || !newStudent.section) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    createStudentMutation.mutate(newStudent);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setEditDialogOpen(true);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;
    updateStudentMutation.mutate({
      id: editingStudent.id,
      nameAr: editingStudent.nameAr,
      nameEn: editingStudent.nameEn,
      parentName: editingStudent.parentName,
      grade: editingStudent.grade,
      section: editingStudent.section,
      school: editingStudent.school,
      points: editingStudent.points,
    });
  };

  const handleDeleteStudent = (studentId: number) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate({ id: studentToDelete });
    }
  };

  const filteredStudents = students?.filter((student) =>
    student.nameAr.includes(searchTerm) || student.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentName = (studentId: number) => {
    const student = students?.find((s) => s.id === studentId);
    return student?.nameAr || "غير معروف";
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc4 100%)",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          background: "linear-gradient(135deg, #1a2332 0%, #2d3e50 100%)",
          borderColor: "#d4af37",
        }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)" }}
            >
              <span className="text-2xl font-bold text-white">م</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة تحكم المدير</h1>
              <p className="text-sm" style={{ color: "#d4af37" }}>
                {user.username}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            style={{
              borderColor: "#d4af37",
              color: "#d4af37",
            }}
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students">إدارة الطلاب</TabsTrigger>
            <TabsTrigger value="transactions">سجل المشتريات</TabsTrigger>
          </TabsList>

          {/* Students Management Tab */}
          <TabsContent value="students">
            <div className="space-y-6">
              {/* Search and Add Button */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ابحث عن طالب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  />
                </div>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
                  }}
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  إضافة طالب جديد
                </Button>
              </div>

              {/* Students Grid */}
              {studentsLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="grid gap-4">
                  {filteredStudents?.map((student) => (
                    <div
                      key={student.id}
                      className="bg-white rounded-lg p-6 shadow-md border-2"
                      style={{ borderColor: "#d4af37" }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: "#1a2332" }}>
                            {student.nameAr}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">ولي الأمر: </span>
                              <span className="font-semibold">{student.parentName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">الصف: </span>
                              <span className="font-semibold">{student.grade}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">الشعبة: </span>
                              <span className="font-semibold">{student.section}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">النقاط: </span>
                              <span
                                className="font-bold text-lg"
                                style={{ color: "#d4af37" }}
                              >
                                {student.points}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStudent(student)}
                            style={{ borderColor: "#d4af37", color: "#1a2332" }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManagePoints(student.id, "add")}
                            style={{ borderColor: "#22c55e", color: "#22c55e" }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManagePoints(student.id, "remove")}
                            style={{ borderColor: "#ef4444", color: "#ef4444" }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStudent(student.id)}
                            style={{ borderColor: "#ef4444", color: "#ef4444" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1a2332" }}>
                سجل المشتريات
              </h2>
              {transactionsLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border-r-4 pr-4 py-3"
                      style={{ borderColor: "#d4af37" }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{getStudentName(transaction.studentId)}</p>
                          <p className="text-sm text-gray-600">{transaction.itemName}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(transaction.transactionDate), "PPp", { locale: ar })}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold" style={{ color: "#d4af37" }}>
                            {transaction.pointsSpent} نقطة
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Points Management Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ fontFamily: "'Tajawal', sans-serif" }}>
          <DialogHeader>
            <DialogTitle>
              {actionType === "add" ? "إضافة نقاط" : "خصم نقاط"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عدد النقاط</Label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="أدخل عدد النقاط"
              />
            </div>
            <div>
              <Label>السبب</Label>
              <Input
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="أدخل سبب التعديل"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitPoints}
              style={{
                background: actionType === "add" ? "#22c55e" : "#ef4444",
                color: "white",
              }}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent style={{ fontFamily: "'Tajawal', sans-serif" }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة طالب جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الاسم بالعربية *</Label>
              <Input
                value={newStudent.nameAr}
                onChange={(e) => setNewStudent({ ...newStudent, nameAr: e.target.value })}
                placeholder="محمد أحمد السيد"
              />
            </div>
            <div>
              <Label>الاسم بالإنجليزية</Label>
              <Input
                value={newStudent.nameEn}
                onChange={(e) => setNewStudent({ ...newStudent, nameEn: e.target.value })}
                placeholder="Mohamed Ahmed"
              />
            </div>
            <div>
              <Label>اسم ولي الأمر *</Label>
              <Input
                value={newStudent.parentName}
                onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                placeholder="أحمد"
              />
            </div>
            <div>
              <Label>الصف *</Label>
              <Input
                type="number"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: parseInt(e.target.value) })}
                placeholder="1"
              />
            </div>
            <div>
              <Label>الشعبة *</Label>
              <Input
                value={newStudent.section}
                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                placeholder="أ"
              />
            </div>
            <div>
              <Label>النقاط الابتدائية</Label>
              <Input
                type="number"
                value={newStudent.points}
                onChange={(e) => setNewStudent({ ...newStudent, points: parseInt(e.target.value) })}
                placeholder="20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAddStudent}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
              }}
            >
              إضافة الطالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ fontFamily: "'Tajawal', sans-serif" }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطالب</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم بالعربية</Label>
                <Input
                  value={editingStudent.nameAr}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, nameAr: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={editingStudent.nameEn}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, nameEn: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>اسم ولي الأمر</Label>
                <Input
                  value={editingStudent.parentName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>الصف</Label>
                <Input
                  type="number"
                  value={editingStudent.grade}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, grade: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>الشعبة</Label>
                <Input
                  value={editingStudent.section}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, section: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>النقاط</Label>
                <Input
                  type="number"
                  value={editingStudent.points}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, points: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateStudent}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
              }}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ fontFamily: "'Tajawal', sans-serif" }}>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته وسجلاته بشكل نهائي ولا يمكن
              التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              style={{ background: "#ef4444" }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

# كيفية تغيير أسماء الطلاب يدوياً
# How to Manually Change Student Names

## الطريقة الأولى: من خلال واجهة إدارة قاعدة البيانات
## Method 1: Through Database Management UI

1. افتح لوحة التحكم في Manus (Management UI)
   Open the Manus Management UI panel

2. انقر على "Database" في القائمة الجانبية
   Click on "Database" in the sidebar

3. ستجد جدول "students" يحتوي على جميع بيانات الطلاب
   You'll find the "students" table containing all student data

4. انقر على أي صف لتعديل بيانات الطالب:
   Click on any row to edit student data:
   - `nameAr`: الاسم الكامل بالعربية (Full name in Arabic)
   - `parentName`: اسم ولي الأمر (Parent name - used for login)
   - `grade`: الصف الدراسي (Grade)
   - `section`: الشعبة (Section)
   - `points`: رصيد النقاط (Points balance)

5. احفظ التغييرات
   Save the changes

---

## الطريقة الثانية: من خلال تعديل ملف seed.mjs
## Method 2: By Editing the seed.mjs File

إذا كنت تريد تغيير جميع الطلاب دفعة واحدة:
If you want to change all students at once:

1. افتح الملف: `/home/ubuntu/maqsaf_alfalah/scripts/seed.mjs`
   Open the file: `/home/ubuntu/maqsaf_alfalah/scripts/seed.mjs`

2. ابحث عن قسم `studentsData` (حوالي السطر 10)
   Find the `studentsData` section (around line 10)

3. عدّل البيانات كما تريد:
   Edit the data as needed:

```javascript
const studentsData = [
  {
    nameAr: "محمد اسامة الأحمد",  // الاسم الكامل
    parentName: "اسامة",           // اسم ولي الأمر (للدخول)
    grade: "الصف الأول",
    section: "أ",
    points: 45,
  },
  // أضف المزيد من الطلاب هنا
  // Add more students here
];
```

4. احذف البيانات القديمة من قاعدة البيانات:
   Delete old data from the database:
   - افتح Database في Management UI
   - احذف جميع الصفوف من جدول `students`
   - احذف جميع الصفوف من جدول `transactions`

5. شغّل السكريبت لإضافة البيانات الجديدة:
   Run the script to add new data:
   ```bash
   cd /home/ubuntu/maqsaf_alfalah
   pnpm exec tsx scripts/seed.mjs
   ```

---

## ملاحظات مهمة
## Important Notes

- **اسم ولي الأمر** (`parentName`) يُستخدم لتسجيل الدخول، تأكد من عدم تكراره
  The **parent name** is used for login, make sure it's unique

- **النقاط** (`points`) يجب أن تكون بين 10 و 50 للطلاب الجدد
  **Points** should be between 10 and 50 for new students

- بعد تغيير البيانات، تأكد من اختبار تسجيل الدخول
  After changing data, make sure to test login functionality

- إذا غيّرت اسم ولي أمر، سيحتاج إلى استخدام الاسم الجديد للدخول
  If you change a parent name, they'll need to use the new name to login

import { drizzle } from "drizzle-orm/mysql2";
import { students, transactions } from "../drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

// Student data extracted from cards
const studentData = [
  { nameAr: "مريم اسامة", nameEn: "maryam aosama", grade: 6, section: "ب", parentName: "اسامة", points: 35 },
  { nameAr: "ندى وسام", nameEn: "nada osam", grade: 6, section: "ب", parentName: "وسام", points: 28 },
  { nameAr: "فاطمة محمود", nameEn: "fatima mahmoud", grade: 5, section: "أ", parentName: "محمود", points: 42 },
  { nameAr: "سارة علي", nameEn: "sarah ali", grade: 6, section: "أ", parentName: "علي", points: 31 },
  { nameAr: "ليلى حسن", nameEn: "layla hassan", grade: 5, section: "ب", parentName: "حسن", points: 38 },
  { nameAr: "نور أحمد", nameEn: "noor ahmad", grade: 4, section: "أ", parentName: "أحمد", points: 25 },
  { nameAr: "هناء محمد", nameEn: "hana mohammad", grade: 6, section: "ج", parentName: "محمد", points: 45 },
  { nameAr: "ريم إبراهيم", nameEn: "reem ibrahim", grade: 5, section: "أ", parentName: "إبراهيم", points: 32 },
  { nameAr: "دينا خالد", nameEn: "dina khaled", grade: 4, section: "ب", parentName: "خالد", points: 20 },
  { nameAr: "أمل سامي", nameEn: "amal sami", grade: 6, section: "ب", parentName: "سامي", points: 50 },
  { nameAr: "زينب عمر", nameEn: "zainab omar", grade: 5, section: "ج", parentName: "عمر", points: 18 },
  { nameAr: "منى يوسف", nameEn: "mona youssef", grade: 4, section: "أ", parentName: "يوسف", points: 27 },
  { nameAr: "رنا طارق", nameEn: "rana tarek", grade: 6, section: "أ", parentName: "طارق", points: 41 },
  { nameAr: "علياء سعيد", nameEn: "alia saeed", grade: 5, section: "ب", parentName: "سعيد", points: 33 },
  { nameAr: "جنى كريم", nameEn: "jana karim", grade: 4, section: "ج", parentName: "كريم", points: 15 },
];

// Food items for fake transactions
const foodItems = [
  { nameAr: "ساندويتش جبن", nameEn: "Cheese Sandwich", points: 5 },
  { nameAr: "ساندويتش دجاج", nameEn: "Chicken Sandwich", points: 7 },
  { nameAr: "عصير برتقال", nameEn: "Orange Juice", points: 3 },
  { nameAr: "عصير تفاح", nameEn: "Apple Juice", points: 3 },
  { nameAr: "كعكة شوكولاتة", nameEn: "Chocolate Cake", points: 4 },
  { nameAr: "بسكويت", nameEn: "Biscuits", points: 2 },
  { nameAr: "فشار", nameEn: "Popcorn", points: 2 },
  { nameAr: "حليب", nameEn: "Milk", points: 2 },
  { nameAr: "كرواسون", nameEn: "Croissant", points: 6 },
  { nameAr: "مافن", nameEn: "Muffin", points: 4 },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Insert students
    console.log("📚 Inserting students...");
    for (const student of studentData) {
      await db.insert(students).values({
        nameAr: student.nameAr,
        nameEn: student.nameEn,
        grade: student.grade,
        section: student.section,
        school: "مدرسة الفلاح الخاصة",
        points: student.points,
        parentName: student.parentName,
      });
    }
    console.log(`✅ Inserted ${studentData.length} students`);

    // Generate fake transactions for each student
    console.log("🛒 Generating fake purchase history...");
    const allStudents = await db.select().from(students);
    let transactionCount = 0;

    for (const student of allStudents) {
      // Generate 3-5 random transactions per student
      const numTransactions = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numTransactions; i++) {
        const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
        const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
        const hoursAgo = Math.floor(Math.random() * 8) + 7; // Random hour between 7am-3pm
        
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - daysAgo);
        transactionDate.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);

        await db.insert(transactions).values({
          studentId: student.id,
          itemName: randomFood.nameAr,
          itemNameEn: randomFood.nameEn,
          pointsSpent: randomFood.points,
          transactionDate: transactionDate,
        });
        
        transactionCount++;
      }
    }
    console.log(`✅ Generated ${transactionCount} fake transactions`);

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Student queries
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  const { students } = await import("../drizzle/schema");
  return await db.select().from(students);
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { students } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByParentName(parentName: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { students } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const result = await db.select().from(students).where(eq(students.parentName, parentName)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStudentPoints(studentId: number, newPoints: number) {
  const db = await getDb();
  if (!db) return;
  const { students } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(students).set({ points: newPoints }).where(eq(students.id, studentId));
}

// Transaction queries
export async function getTransactionsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { transactions } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");
  return await db.select().from(transactions).where(eq(transactions.studentId, studentId)).orderBy(desc(transactions.transactionDate));
}

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];
  const { transactions } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return await db.select().from(transactions).orderBy(desc(transactions.transactionDate));
}

// Points history queries
export async function addPointsHistory(data: { studentId: number; amount: number; reason: string; actionBy: string; actionByRole: "teacher" | "principal" | "system" }) {
  const db = await getDb();
  if (!db) return;
  const { pointsHistory } = await import("../drizzle/schema");
  await db.insert(pointsHistory).values(data);
}

export async function getPointsHistoryByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { pointsHistory } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");
  return await db.select().from(pointsHistory).where(eq(pointsHistory.studentId, studentId)).orderBy(desc(pointsHistory.createdAt));
}

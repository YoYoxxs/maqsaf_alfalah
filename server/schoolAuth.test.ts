import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("School Authentication", () => {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  it("should authenticate a valid parent", async () => {
    const result = await caller.schoolAuth.login({
      username: "اسامة",
      role: "parent",
    });

    expect(result.success).toBe(true);
    expect(result.user.role).toBe("parent");
    expect(result.user.username).toBe("اسامة");
    expect(result.user.studentId).toBeDefined();
  });

  it("should reject invalid parent username", async () => {
    await expect(
      caller.schoolAuth.login({
        username: "invalid_parent",
        role: "parent",
      })
    ).rejects.toThrow("اسم ولي الأمر غير صحيح");
  });

  it("should authenticate a valid teacher", async () => {
    const result = await caller.schoolAuth.login({
      username: "فاطمة الشرقاوي",
      role: "teacher",
    });

    expect(result.success).toBe(true);
    expect(result.user.role).toBe("teacher");
    expect(result.user.username).toBe("فاطمة الشرقاوي");
  });

  it("should reject invalid teacher username", async () => {
    await expect(
      caller.schoolAuth.login({
        username: "invalid_teacher",
        role: "teacher",
      })
    ).rejects.toThrow("اسم المدرس غير صحيح");
  });

  it("should authenticate the principal", async () => {
    const result = await caller.schoolAuth.login({
      username: "أحمد محمد",
      role: "principal",
    });

    expect(result.success).toBe(true);
    expect(result.user.role).toBe("principal");
    expect(result.user.username).toBe("أحمد محمد");
  });

  it("should reject invalid principal username", async () => {
    await expect(
      caller.schoolAuth.login({
        username: "invalid_principal",
        role: "principal",
      })
    ).rejects.toThrow("اسم المدير غير صحيح");
  });
});

describe("Students API", () => {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  it("should retrieve all students", async () => {
    const students = await caller.students.getAll();
    expect(students).toBeDefined();
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);
  });

  it("should retrieve a student by ID", async () => {
    const students = await caller.students.getAll();
    const firstStudent = students[0];
    
    if (firstStudent) {
      const student = await caller.students.getById({ id: firstStudent.id });
      expect(student).toBeDefined();
      expect(student?.id).toBe(firstStudent.id);
      expect(student?.nameAr).toBe(firstStudent.nameAr);
    }
  });

  it("should update student points", async () => {
    const students = await caller.students.getAll();
    const firstStudent = students[0];
    
    if (firstStudent) {
      const initialPoints = firstStudent.points;
      const result = await caller.students.updatePoints({
        studentId: firstStudent.id,
        amount: 10,
        reason: "اختبار",
        actionBy: "فاطمة الشرقاوي",
        actionByRole: "teacher",
      });

      expect(result.success).toBe(true);
      expect(result.newPoints).toBe(initialPoints + 10);
    }
  });

  it("should reject negative points that exceed balance", async () => {
    const students = await caller.students.getAll();
    const firstStudent = students[0];
    
    if (firstStudent) {
      await expect(
        caller.students.updatePoints({
          studentId: firstStudent.id,
          amount: -(firstStudent.points + 100),
          reason: "اختبار",
          actionBy: "أحمد محمد",
          actionByRole: "principal",
        })
      ).rejects.toThrow("النقاط غير كافية");
    }
  });
});

describe("Transactions API", () => {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  it("should retrieve all transactions", async () => {
    const transactions = await caller.transactions.getAll();
    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should retrieve transactions by student ID", async () => {
    const students = await caller.students.getAll();
    const firstStudent = students[0];
    
    if (firstStudent) {
      const transactions = await caller.transactions.getByStudentId({
        studentId: firstStudent.id,
      });
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    }
  });
});

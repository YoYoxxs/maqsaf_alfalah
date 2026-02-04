import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // School authentication and data routers
  schoolAuth: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        role: z.enum(["parent", "teacher", "principal"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getAllStudents } = await import("./db");
        
        // Validate username based on role
        if (input.role === "parent") {
          // Parent username should match a student's parent name
          const students = await getAllStudents();
          const student = students.find(s => s.parentName === input.username);
          
          if (!student) {
            throw new Error("اسم ولي الأمر غير صحيح");
          }
          
          return {
            success: true,
            user: {
              username: input.username,
              role: input.role,
              studentId: student.id,
            },
          };
        } else if (input.role === "teacher") {
          // Teacher username: تيماء
          const validTeachers = ["تيماء"];
          if (!validTeachers.includes(input.username)) {
            throw new Error("اسم المدرس غير صحيح");
          }
          
          return {
            success: true,
            user: {
              username: input.username,
              role: input.role,
            },
          };
        } else if (input.role === "principal") {
          // Principal username: غادة خطايبه
          if (input.username !== "غادة خطايبه") {
            throw new Error("اسم المدير غير صحيح");
          }
          
          return {
            success: true,
            user: {
              username: input.username,
              role: input.role,
            },
          };
        }
        
        throw new Error("خطأ في تسجيل الدخول");
      }),
  }),
  
  students: router({
    getAll: publicProcedure.query(async () => {
      const { getAllStudents } = await import("./db");
      return await getAllStudents();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getStudentById } = await import("./db");
        return await getStudentById(input.id);
      }),
    
    updatePoints: publicProcedure
      .input(z.object({
        studentId: z.number(),
        amount: z.number(),
        reason: z.string(),
        actionBy: z.string(),
        actionByRole: z.enum(["teacher", "principal", "system"]),
      }))
      .mutation(async ({ input }) => {
        const { getStudentById, updateStudentPoints, addPointsHistory } = await import("./db");
        
        const student = await getStudentById(input.studentId);
        if (!student) {
          throw new Error("الطالب غير موجود");
        }
        
        const newPoints = student.points + input.amount;
        if (newPoints < 0) {
          throw new Error("النقاط غير كافية");
        }
        
        await updateStudentPoints(input.studentId, newPoints);
        await addPointsHistory({
          studentId: input.studentId,
          amount: input.amount,
          reason: input.reason,
          actionBy: input.actionBy,
          actionByRole: input.actionByRole,
        });
        
        return { success: true, newPoints };
      }),
  }),
  
  transactions: router({
    getByStudentId: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const { getTransactionsByStudentId } = await import("./db");
        return await getTransactionsByStudentId(input.studentId);
      }),
    
    getAll: publicProcedure.query(async () => {
      const { getAllTransactions } = await import("./db");
      return await getAllTransactions();
    }),
  }),
});

export type AppRouter = typeof appRouter;

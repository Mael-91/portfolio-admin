import "express-session";

declare module "express-session" {
  interface SessionData {
    adminUser?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    pendingAboutImageUrl?: string;
  }
}
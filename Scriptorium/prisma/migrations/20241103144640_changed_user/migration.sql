/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "numOfUpvotes" INTEGER NOT NULL DEFAULT 0,
    "numOfDownvotes" INTEGER NOT NULL DEFAULT 0,
    "numOfReports" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BlogPost_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("author_id", "content", "created_at", "description", "id", "numOfDownvotes", "numOfReports", "numOfUpvotes", "title", "updated_at") SELECT "author_id", "content", "created_at", "description", "id", "numOfDownvotes", "numOfReports", "numOfUpvotes", "title", "updated_at" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blog_post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "numOfUpvotes" INTEGER NOT NULL DEFAULT 0,
    "numOfDownvotes" INTEGER NOT NULL DEFAULT 0,
    "numOfReports" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Comment_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "BlogPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("blog_post_id", "content", "created_at", "id", "numOfDownvotes", "numOfReports", "numOfUpvotes", "parent_id", "user_id") SELECT "blog_post_id", "content", "created_at", "id", "numOfDownvotes", "numOfReports", "numOfUpvotes", "parent_id", "user_id" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT DEFAULT 'user_default.png',
    "phone_number" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "first_name", "id", "last_name", "password", "phone_number", "updatedAt", "username") SELECT "avatar", "createdAt", "email", "first_name", "id", "last_name", "password", "phone_number", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

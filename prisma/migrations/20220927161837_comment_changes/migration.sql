/*
  Warnings:

  - You are about to drop the column `commentId` on the `Tweets` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tweets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT,
    "image" TEXT,
    "userId" INTEGER,
    CONSTRAINT "Tweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tweets" ("content", "id", "image", "userId") SELECT "content", "id", "image", "userId" FROM "Tweets";
DROP TABLE "Tweets";
ALTER TABLE "new_Tweets" RENAME TO "Tweets";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "userId" INTEGER,
    "tweetsId" INTEGER,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comment_tweetsId_fkey" FOREIGN KEY ("tweetsId") REFERENCES "Tweets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "id", "userId") SELECT "content", "id", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

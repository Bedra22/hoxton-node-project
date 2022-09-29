/*
  Warnings:

  - Made the column `tweetsId` on table `Save` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Save` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tweetsId` on table `ReTweet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `ReTweet` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Save" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tweetsId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Save_tweetsId_fkey" FOREIGN KEY ("tweetsId") REFERENCES "Tweets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Save_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Save" ("id", "tweetsId", "userId") SELECT "id", "tweetsId", "userId" FROM "Save";
DROP TABLE "Save";
ALTER TABLE "new_Save" RENAME TO "Save";
CREATE TABLE "new_ReTweet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tweetsId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ReTweet_tweetsId_fkey" FOREIGN KEY ("tweetsId") REFERENCES "Tweets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReTweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReTweet" ("id", "tweetsId", "userId") SELECT "id", "tweetsId", "userId" FROM "ReTweet";
DROP TABLE "ReTweet";
ALTER TABLE "new_ReTweet" RENAME TO "ReTweet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

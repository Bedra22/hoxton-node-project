-- AlterTable
ALTER TABLE "User" ADD COLUMN "Bio" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneNr" INTEGER;
ALTER TABLE "User" ADD COLUMN "profilePic" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tweets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "image" TEXT,
    "userId" INTEGER,
    CONSTRAINT "Tweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tweets" ("content", "id", "image", "title", "userId") SELECT "content", "id", "image", "title", "userId" FROM "Tweets";
DROP TABLE "Tweets";
ALTER TABLE "new_Tweets" RENAME TO "Tweets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

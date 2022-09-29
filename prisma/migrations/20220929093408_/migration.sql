-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "trendTweets" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Trends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trends" ("id", "title", "trendTweets", "type", "userId") SELECT "id", "title", "trendTweets", "type", "userId" FROM "Trends";
DROP TABLE "Trends";
ALTER TABLE "new_Trends" RENAME TO "Trends";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

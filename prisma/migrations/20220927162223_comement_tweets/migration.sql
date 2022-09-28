/*
  Warnings:

  - You are about to drop the column `tweetsId` on the `Comment` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_CommentToTweets" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CommentToTweets_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CommentToTweets_B_fkey" FOREIGN KEY ("B") REFERENCES "Tweets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "id", "userId") SELECT "content", "id", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_CommentToTweets_AB_unique" ON "_CommentToTweets"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentToTweets_B_index" ON "_CommentToTweets"("B");

-- CreateTable
CREATE TABLE "_TemplateBlogPosts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TemplateBlogPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TemplateBlogPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateBlogPosts_AB_unique" ON "_TemplateBlogPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateBlogPosts_B_index" ON "_TemplateBlogPosts"("B");

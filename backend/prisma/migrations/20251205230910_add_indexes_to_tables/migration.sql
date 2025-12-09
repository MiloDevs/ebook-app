-- CreateIndex
CREATE INDEX "account_id_idx" ON "account"("id");

-- CreateIndex
CREATE INDEX "author_id_first_name_last_name_full_name_idx" ON "author"("id", "first_name", "last_name", "full_name");

-- CreateIndex
CREATE INDEX "book_id_title_author_id_rating_recommended_released_at_idx" ON "book"("id", "title", "author_id", "rating", "recommended", "released_at");

-- CreateIndex
CREATE INDEX "genre_id_title_idx" ON "genre"("id", "title");

-- CreateIndex
CREATE INDEX "session_id_idx" ON "session"("id");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "verification_id_idx" ON "verification"("id");

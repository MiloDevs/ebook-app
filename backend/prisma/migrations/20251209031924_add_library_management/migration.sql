-- CreateTable
CREATE TABLE "library" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_book" (
    "id" UUID NOT NULL,
    "library_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "library_id_user_id_idx" ON "library"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_user_id_name_key" ON "library"("user_id", "name");

-- CreateIndex
CREATE INDEX "library_book_library_id_book_id_idx" ON "library_book"("library_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_book_library_id_book_id_key" ON "library_book"("library_id", "book_id");

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_book" ADD CONSTRAINT "library_book_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_book" ADD CONSTRAINT "library_book_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "StudioMember" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudioMember_email_key" ON "StudioMember"("email");


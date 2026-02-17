-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('HomamYagam', 'HomePooja', 'PoojaSamagri', 'FamilyConnect');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "service_type" "ServiceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_requests_member_id_idx" ON "service_requests"("member_id");

-- CreateIndex
CREATE INDEX "service_requests_provider_id_idx" ON "service_requests"("provider_id");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

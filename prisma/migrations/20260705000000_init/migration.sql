-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WaitlistRole" AS ENUM ('candidate', 'company');

-- CreateEnum
CREATE TYPE "ExperienceBand" AS ENUM ('UNDER_1', 'ONE_TO_3', 'THREE_TO_6', 'SIX_PLUS');

-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD');

-- CreateEnum
CREATE TYPE "WorkFormat" AS ENUM ('OFFICE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VacancyCloseReason" AS ENUM ('HIRED_VIA_PROVA', 'HIRED_ELSEWHERE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('STARTED', 'SUBMITTED', 'IN_REVIEW', 'INTERESTED', 'MATCHED', 'FINAL', 'HIRED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EventActor" AS ENUM ('CANDIDATE', 'COMPANY', 'SYSTEM');

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WaitlistRole" NOT NULL,
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "experience" "ExperienceBand" NOT NULL,
    "software" TEXT[],
    "headline" TEXT,
    "portfolioLinks" TEXT[],
    "cvFileUrl" TEXT,
    "isIncognito" BOOLEAN NOT NULL DEFAULT false,
    "employment" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "about" TEXT,
    "links" JSONB,
    "showcase" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioMember" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "photoUrl" TEXT,

    CONSTRAINT "StudioMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seniority" "Seniority" NOT NULL,
    "format" "WorkFormat" NOT NULL,
    "city" TEXT,
    "employmentType" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT,
    "software" TEXT[],
    "languages" TEXT[],
    "descriptionMd" TEXT NOT NULL,
    "briefMd" TEXT NOT NULL,
    "briefFileUrl" TEXT,
    "briefPublic" BOOLEAN NOT NULL DEFAULT true,
    "expectedTimeMin" INTEGER NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "validThrough" TIMESTAMP(3),
    "closeReason" "VacancyCloseReason",
    "hiredApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'STARTED',
    "submissionFileUrl" TEXT,
    "submissionLink" TEXT,
    "submissionComment" TEXT,
    "interestMessage" TEXT,
    "declineReason" TEXT,
    "revealedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "matchedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "actor" "EventActor" NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_email_key" ON "WaitlistSignup"("email");

-- CreateIndex
CREATE INDEX "WaitlistSignup_role_idx" ON "WaitlistSignup"("role");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StudioMember_userId_key" ON "StudioMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vacancy_slug_key" ON "Vacancy"("slug");

-- CreateIndex
CREATE INDEX "Vacancy_status_idx" ON "Vacancy"("status");

-- CreateIndex
CREATE INDEX "Vacancy_studioId_idx" ON "Vacancy"("studioId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_vacancyId_candidateId_key" ON "Application"("vacancyId", "candidateId");

-- CreateIndex
CREATE INDEX "ApplicationEvent_applicationId_createdAt_idx" ON "ApplicationEvent"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudioMember" ADD CONSTRAINT "StudioMember_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


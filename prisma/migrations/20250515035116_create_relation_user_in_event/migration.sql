-- CreateTable
CREATE TABLE "PeopleOnEvents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "PeopleOnEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeopleOnEvents_userId_eventId_key" ON "PeopleOnEvents"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "PeopleOnEvents" ADD CONSTRAINT "PeopleOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeopleOnEvents" ADD CONSTRAINT "PeopleOnEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

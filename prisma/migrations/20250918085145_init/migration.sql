-- CreateTable
CREATE TABLE "Candidates" (
    "Candidate_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Othername" TEXT,
    "AliasName" TEXT,
    "Party_ID" INTEGER,
    "Ward_Code" TEXT,
    "Position_ID" INTEGER,
    "Image" BLOB,
    CONSTRAINT "Candidates_Position_ID_fkey" FOREIGN KEY ("Position_ID") REFERENCES "Positions" ("Position_ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Candidates_Ward_Code_fkey" FOREIGN KEY ("Ward_Code") REFERENCES "Wards" ("Ward_Code") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Candidates_Party_ID_fkey" FOREIGN KEY ("Party_ID") REFERENCES "Parties" ("Party_ID") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Constituencies" (
    "Constituency_Code" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Constituency_Name" TEXT,
    "District_Code" TEXT,
    CONSTRAINT "Constituencies_District_Code_fkey" FOREIGN KEY ("District_Code") REFERENCES "Districts" ("District_Code") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Districts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "District_Code" TEXT NOT NULL,
    "District_Name" TEXT NOT NULL,
    "Province_Code" INTEGER,
    CONSTRAINT "Districts_Province_Code_fkey" FOREIGN KEY ("Province_Code") REFERENCES "Provinces" ("Province_Code") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "ElectionCandidates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Election" INTEGER,
    "Candidate" INTEGER,
    CONSTRAINT "ElectionCandidates_Election_fkey" FOREIGN KEY ("Election") REFERENCES "Elections" ("Election_ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "ElectionCandidates_Candidate_fkey" FOREIGN KEY ("Candidate") REFERENCES "Candidates" ("Candidate_ID") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "ElectionPositions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Election" INTEGER,
    "Position" INTEGER,
    CONSTRAINT "ElectionPositions_Position_fkey" FOREIGN KEY ("Position") REFERENCES "Positions" ("Position_ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "ElectionPositions_Election_fkey" FOREIGN KEY ("Election") REFERENCES "Elections" ("Election_ID") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Election_Voters" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Voter" INTEGER,
    "ElectionID" INTEGER,
    CONSTRAINT "Election_Voters_ElectionID_fkey" FOREIGN KEY ("ElectionID") REFERENCES "Elections" ("Election_ID") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Elections" (
    "Election_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "Description" TEXT,
    "StartDate" TEXT NOT NULL,
    "EndDate" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Year" INTEGER NOT NULL,
    "Election_Type" TEXT NOT NULL,
    "Province_Code" INTEGER,
    "District_Code" TEXT,
    "Constituency_Code" INTEGER,
    "Ward_Code" TEXT,
    CONSTRAINT "Elections_Ward_Code_fkey" FOREIGN KEY ("Ward_Code") REFERENCES "Wards" ("Ward_Code") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Elections_Constituency_Code_fkey" FOREIGN KEY ("Constituency_Code") REFERENCES "Constituencies" ("Constituency_Code") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Elections_District_Code_fkey" FOREIGN KEY ("District_Code") REFERENCES "Districts" ("District_Code") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Elections_Province_Code_fkey" FOREIGN KEY ("Province_Code") REFERENCES "Provinces" ("Province_Code") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Levels" (
    "Level_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Parties" (
    "Party_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Party_Name" TEXT NOT NULL,
    "Party_Acronym" TEXT,
    "Slogan" TEXT
);

-- CreateTable
CREATE TABLE "Positions" (
    "Position_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Position_Name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Provinces" (
    "Province_Code" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Province_Name" TEXT
);

-- CreateTable
CREATE TABLE "Voters" (
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "NRC" TEXT NOT NULL,
    "Ward" TEXT NOT NULL,
    "Constituency" TEXT NOT NULL,
    "Email" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY,
    "passwordHash" TEXT NOT NULL,
    CONSTRAINT "Voters_Ward_fkey" FOREIGN KEY ("Ward") REFERENCES "Wards" ("Ward_Code") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Votes" (
    "Vote_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Candidate_ID" INTEGER,
    "Ward_Code" TEXT,
    "Election_ID" INTEGER,
    "Vote_Hash" TEXT,
    "Voters_ID" TEXT,
    CONSTRAINT "Votes_Election_ID_fkey" FOREIGN KEY ("Election_ID") REFERENCES "Elections" ("Election_ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Votes_Ward_Code_fkey" FOREIGN KEY ("Ward_Code") REFERENCES "Wards" ("Ward_Code") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Votes_Candidate_ID_fkey" FOREIGN KEY ("Candidate_ID") REFERENCES "Candidates" ("Candidate_ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Votes_Voters_ID_fkey" FOREIGN KEY ("Voters_ID") REFERENCES "Voters" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Wards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Ward_Code" TEXT NOT NULL,
    "Ward_Name" TEXT NOT NULL,
    "Constituency_Code" INTEGER,
    CONSTRAINT "Wards_Constituency_Code_fkey" FOREIGN KEY ("Constituency_Code") REFERENCES "Constituencies" ("Constituency_Code") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Candidates_1" ON "Candidates"("Position_ID", "Ward_Code", "Party_ID");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Districts_1" ON "Districts"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Districts_2" ON "Districts"("District_Code");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_ElectionCandidates_1" ON "ElectionCandidates"("Election", "Candidate");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Levels_1" ON "Levels"("Name");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Parties_1" ON "Parties"("Party_Name");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Parties_2" ON "Parties"("Party_Acronym");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Positions_1" ON "Positions"("Position_Name");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Provinces_1" ON "Provinces"("Province_Name");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Voters_1" ON "Voters"("NRC");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Votes_1" ON "Votes"("Vote_Hash");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Wards_1" ON "Wards"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Wards_2" ON "Wards"("Ward_Code");
Pragma writable_schema=0;

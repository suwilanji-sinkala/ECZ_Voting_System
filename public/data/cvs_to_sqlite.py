import pandas as pd
import sqlite3

# Step 1: Load all columns as strings
csv_file = "hierarchical_locations.csv"
df = pd.read_csv(csv_file, dtype=str)  # Load everything as string
df.columns = df.columns.str.strip().str.replace(" ", "_")  # Clean column names

# Step 2: Drop rows with missing essential codes
df = df.dropna(subset=["Province_Code", "Province_Name", "District_Code", "District_Name",
                       "Constituency_Code", "Constituency_Name", "Ward_Code", "Ward_Name"])

# Step 3: Generate composite codes
df["New_District_Code"] = df["Province_Code"].str.strip() + df["District_Code"].str.strip()
df["New_Ward_Code"] = df["Constituency_Code"].str.strip() + df["Ward_Code"].str.strip()

# Step 4: Convert relevant fields to appropriate types
df["Province_Code"] = df["Province_Code"].astype(int)
df["Constituency_Code"] = df["Constituency_Code"].astype(int)

# Step 5: Connect to SQLite
conn = sqlite3.connect("ecz_db_1.4.db")
cursor = conn.cursor()

# Step 6: Create normalized location tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS Provinces (
    Province_Code INTEGER PRIMARY KEY,
    Province_Name TEXT UNIQUE
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS Districts (
    District_Code TEXT PRIMARY KEY,
    District_Name TEXT,
    Province_Code INTEGER,
    FOREIGN KEY (Province_Code) REFERENCES Provinces(Province_Code)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS Constituencies (
    Constituency_Code INTEGER PRIMARY KEY,
    Constituency_Name TEXT,
    District_Code TEXT,
    FOREIGN KEY (District_Code) REFERENCES Districts(District_Code)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS Wards (
    Ward_Code TEXT PRIMARY KEY,
    Ward_Name TEXT,
    Constituency_Code INTEGER,
    FOREIGN KEY (Constituency_Code) REFERENCES Constituencies(Constituency_Code)
)
''')

# Step 7: Insert location data with deduplication
df[['Province_Code', 'Province_Name']].drop_duplicates().to_sql(
    'Provinces', conn, if_exists='append', index=False
)

district_df = df[['New_District_Code', 'District_Name', 'Province_Code']].drop_duplicates(
    subset=['New_District_Code']
).rename(columns={'New_District_Code': 'District_Code'})
district_df.to_sql('Districts', conn, if_exists='append', index=False)

constituency_df = df[['Constituency_Code', 'Constituency_Name', 'New_District_Code']].drop_duplicates(
    subset=['Constituency_Code']
).rename(columns={'New_District_Code': 'District_Code'})
constituency_df.to_sql('Constituencies', conn, if_exists='append', index=False)

ward_df = df[['New_Ward_Code', 'Ward_Name', 'Constituency_Code']].drop_duplicates(
    subset=['New_Ward_Code']
).rename(columns={'New_Ward_Code': 'Ward_Code'})
ward_df.to_sql('Wards', conn, if_exists='append', index=False)

# Step 8: Create political structure tables

# Positions
cursor.execute('''
CREATE TABLE IF NOT EXISTS Positions (
    Position_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Position_Name TEXT UNIQUE NOT NULL
)
''')

# Parties
cursor.execute('''
CREATE TABLE IF NOT EXISTS Parties (
    Party_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Party_Name TEXT UNIQUE NOT NULL
)
''')

# Candidates (Position_ID as foreign key)
cursor.execute('''
CREATE TABLE IF NOT EXISTS Candidates (
    Candidate_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Candidate_Name TEXT NOT NULL,
    Party_ID INTEGER,
    Constituency_Code INTEGER,
    Position_ID INTEGER,
    FOREIGN KEY (Party_ID) REFERENCES Parties(Party_ID),
    FOREIGN KEY (Constituency_Code) REFERENCES Constituencies(Constituency_Code),
    FOREIGN KEY (Position_ID) REFERENCES Positions(Position_ID)
)
''')

# Elections
cursor.execute('''
CREATE TABLE IF NOT EXISTS Elections (
    Election_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Year INTEGER NOT NULL,
    Election_Type TEXT NOT NULL
)
''')

# Votes
cursor.execute('''
CREATE TABLE IF NOT EXISTS Votes (
    Vote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Candidate_ID INTEGER,
    Ward_Code TEXT,
    Election_ID INTEGER,
    Vote_Count INTEGER,
    FOREIGN KEY (Candidate_ID) REFERENCES Candidates(Candidate_ID),
    FOREIGN KEY (Ward_Code) REFERENCES Wards(Ward_Code),
    FOREIGN KEY (Election_ID) REFERENCES Elections(Election_ID)
)
''')

# Step 9: Insert sample data

# Insert positions
cursor.executemany("INSERT OR IGNORE INTO Positions (Position_Name) VALUES (?)", [
    ("President",),
    ("Member of Parliament",),
    ("Councillor",)
])

# Insert parties
cursor.executemany("INSERT OR IGNORE INTO Parties (Party_Name) VALUES (?)", [
    ("Patriotic Alliance",),
    ("United Zambians Front",),
    ("Progressive People's Party",)
])

# Insert election
cursor.execute("INSERT INTO Elections (Year, Election_Type) VALUES (?, ?)", (2021, "General"))

# Get foreign keys
cursor.execute("SELECT Position_ID FROM Positions WHERE Position_Name = 'President'")
president_id = cursor.fetchone()[0]

cursor.execute("SELECT Position_ID FROM Positions WHERE Position_Name = 'Member of Parliament'")
mp_id = cursor.fetchone()[0]

cursor.execute("SELECT Position_ID FROM Positions WHERE Position_Name = 'Councillor'")
councillor_id = cursor.fetchone()[0]

cursor.execute("SELECT Party_ID FROM Parties WHERE Party_Name = 'Patriotic Alliance'")
party_1 = cursor.fetchone()[0]

cursor.execute("SELECT Party_ID FROM Parties WHERE Party_Name = 'United Zambians Front'")
party_2 = cursor.fetchone()[0]


cursor.execute("SELECT Election_ID FROM Elections WHERE Year = 2021")
election_id = cursor.fetchone()[0]

cursor.execute("SELECT Constituency_Code FROM Constituencies LIMIT 1")
constituency_code_sample = cursor.fetchone()[0]

cursor.execute("SELECT Ward_Code FROM Wards LIMIT 2")
ward_samples = [row[0] for row in cursor.fetchall()]

# Insert candidates (random Zambian names)
candidates = [
    ("Mutale Chibale", party_1, constituency_code_sample, president_id),
    ("Lombe Mwansa", party_2, constituency_code_sample, president_id),
    ("Twaambo Nsofwa", party_1, constituency_code_sample, mp_id),
    ("Kangwa Tembo", party_1, constituency_code_sample, mp_id),
    ("Chanda Mumba", party_2, constituency_code_sample, councillor_id),
    ("Bupe Zulu", party_2, constituency_code_sample, councillor_id)
]

cursor.executemany("""
INSERT INTO Candidates (Candidate_Name, Party_ID, Constituency_Code, Position_ID)
VALUES (?, ?, ?, ?)
""", candidates)

# Fetch candidate IDs
cursor.execute("SELECT Candidate_ID FROM Candidates WHERE Candidate_Name = 'Mutale Chibale'")
cand_1 = cursor.fetchone()[0]

cursor.execute("SELECT Candidate_ID FROM Candidates WHERE Candidate_Name = 'Lombe Mwansa'")
cand_2 = cursor.fetchone()[0]

# Insert dummy votes
cursor.executemany("""
INSERT INTO Votes (Candidate_ID, Ward_Code, Election_ID, Vote_Count)
VALUES (?, ?, ?, ?)
""", [
    (cand_1, ward_samples[0], election_id, 540),
    (cand_2, ward_samples[1], election_id, 470)
])

# Finalize
conn.commit()
conn.close()

print("✅ CSV loaded, normalized, and political data saved to SQLite successfully.")


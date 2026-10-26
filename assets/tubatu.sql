CREATE TABLE releases (
  RelID    INT NOT NULL,
  RelTitle VARCHAR(200),
  RelType  VARCHAR(10) DEFAULT 'album',
  CovImg   VARCHAR(50),
  RelDate  DATE,
  PRIMARY KEY (RelID)
);

CREATE TABLE unit (
  UnitID   CHAR(5) NOT NULL,
  UnitName VARCHAR(50),
  PRIMARY KEY (UnitID)
);

CREATE TABLE members (
  MemID     INT NOT NULL,
  MemName   VARCHAR(50) NOT NULL,
  StgName   VARCHAR(50) NOT NULL,
  EngName   VARCHAR(50),
  MemDOB    DATE,
  MemPos    VARCHAR(50),
  CursorImg VARCHAR(50),
  UnitID    CHAR(5),
  PRIMARY KEY (MemID),
  FOREIGN KEY (UnitID) REFERENCES unit(UnitID)
);

CREATE TABLE songs (
  SongID    CHAR(5) NOT NULL,
  RelID     INT NOT NULL,
  UnitID    CHAR(5) NOT NULL,
  SongTitle VARCHAR(100),
  AudioSrc  VARCHAR(50),
  PRIMARY KEY (SongID),
  FOREIGN KEY (RelID) REFERENCES releases(RelID),
  FOREIGN KEY (UnitID) REFERENCES unit(UnitID)
);
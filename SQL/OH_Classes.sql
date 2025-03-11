CREATE TABLE OH_Classes (
    classID INT IDENTITY(1,1) PRIMARY KEY,
    activityName NVARCHAR(100) UNIQUE NOT NULL,
    startDate DATETIME NOT NULL,
    capacity INT NOT NULL,
    hostID INT,
    [location] NVARCHAR(MAX),
    PicID INT,
    isRecurring BIT DEFAULT 0,
    recurrenceLevel INT NOT NULL,
    recurrenceDetails VARCHAR(MAX),
    sessionAmount INT,
    CONSTRAINT FK_Classes_Host FOREIGN KEY (hostID)
        REFERENCES OH_People(personID),
    CONSTRAINT FK_Classes_Pic FOREIGN KEY (PicID)
        REFERENCES OH_Pictures(PicID)
);
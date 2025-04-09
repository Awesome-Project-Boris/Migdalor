CREATE TABLE OH_Activities (
    activityID INT IDENTITY(1,1) PRIMARY KEY,
    activityName NVARCHAR(100) UNIQUE NOT NULL,
    startDate DATETIME NOT NULL,
    capacity INT NOT NULL,
    hostID UNIQUEIDENTIFIER,
    [location] NVARCHAR(MAX),
    PicID INT,
    CONSTRAINT FK_Activities_Host FOREIGN KEY (hostID)
        REFERENCES OH_People(personID),
    CONSTRAINT FK_Activities_Pic FOREIGN KEY (PicID)
        REFERENCES OH_Pictures(PicID)
);

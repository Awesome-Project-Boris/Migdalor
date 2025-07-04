CREATE TABLE dbo.OH_ResidentsInterests (
    residentID UNIQUEIDENTIFIER NOT NULL,
    interestName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_OH_ResidentsInterests PRIMARY KEY (residentID, interestName),
    CONSTRAINT FK_ResidentsInterests_Residents FOREIGN KEY (residentID)
        REFERENCES dbo.OH_Residents (residentID)
        ON DELETE CASCADE,
    CONSTRAINT FK_ResidentsInterests_Interests FOREIGN KEY (interestName)
        REFERENCES dbo.OH_Interests (interestName)
        ON DELETE CASCADE
);
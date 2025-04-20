CREATE TABLE OH_Residents (
    residentID UNIQUEIDENTIFIER PRIMARY KEY,
    hasLoggedIn BIT NOT NULL DEFAULT 0,
    isActive BIT NOT NULL DEFAULT 1,
    branchName NVARCHAR(100) NOT NULL,
    isBokerTov BIT NOT NULL DEFAULT 1,
    canInitActivity BIT NOT NULL DEFAULT 0,
    spouseID UNIQUEIDENTIFIER NULL,
    spouseHebName NVARCHAR(100) NULL,
    spouseEngName NVARCHAR(100) NULL,
    dateOfArrival DATE NOT NULL DEFAULT GETDATE(),
    homePlace NVARCHAR(100),
    profession NVARCHAR(100),
    residentDescription NVARCHAR(MAX),
    additionalPic1ID INT,
    additionalPic2ID INT,
    residentApartmentNumber INT,
    CONSTRAINT FK_Residents_People FOREIGN KEY (residentID)
        REFERENCES OH_People(personID),
    CONSTRAINT FK_Residents_Spouse FOREIGN KEY (spouseID)
        REFERENCES OH_Residents(residentID),
    CONSTRAINT FK_Residents_AdditionalPic1 FOREIGN KEY (additionalPic1ID)
        REFERENCES OH_Pictures(PicID),
    CONSTRAINT FK_Residents_AdditionalPic2 FOREIGN KEY (additionalPic2ID)
        REFERENCES OH_Pictures(PicID),
);

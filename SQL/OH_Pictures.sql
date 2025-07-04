CREATE TABLE dbo.OH_Pictures (
    picID INT IDENTITY(1,1) PRIMARY KEY,
    picName VARCHAR(MAX) NOT NULL,
    picPath VARCHAR(MAX) NOT NULL,
    picAlt VARCHAR(255) NOT NULL,
    uploaderID UNIQUEIDENTIFIER NULL,
    picRole VARCHAR(50) NULL DEFAULT 'unassigned',
    ListingID INT NULL,
    dateTime DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Pictures_Uploader FOREIGN KEY (uploaderID) REFERENCES dbo.OH_People(personID),
    CONSTRAINT FK_OH_Pictures_OH_Listings FOREIGN KEY (ListingID) REFERENCES dbo.OH_Listings(ListingID) ON DELETE CASCADE,
    CONSTRAINT CHK_OH_Pictures_picRole CHECK (picRole IN ('marketplace_extra', 'marketplace', 'secondary_profile', 'profile_picture', 'unassigned'))
);
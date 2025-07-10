CREATE TABLE OH_Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    HebrewName NVARCHAR(100) NOT NULL,
    EnglishName NVARCHAR(100) NULL,
    HebrewDescription NVARCHAR(500) NULL,
    EnglishDescription NVARCHAR(500) NULL,
    HebrewAddendum NVARCHAR(MAX) NULL,
    EnglishAddendum NVARCHAR(MAX) NULL, 
    LocationID INT NULL, 
    PictureID INT NULL, 
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Service_Picture FOREIGN KEY (PictureID) REFERENCES OH_Pictures(PicID)
);
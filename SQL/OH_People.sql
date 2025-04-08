CREATE TABLE
    OH_People (
        personID UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID (),
        phoneNumber VARCHAR(15) UNIQUE NOT NULL CHECK (phoneNumber NOT LIKE '%[^0-9]%'),
        hebFirstName NVARCHAR (100) NOT NULL,
        hebLastName NVARCHAR (100) NOT NULL,
        engFirstName NVARCHAR (100),
        engLastName NVARCHAR (100),
        gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
        profilePicID INT,
        email VARCHAR(2048),
        passwordHash VARCHAR(128) NOT NULL,
        dateOfBirth DATE CHECK (dateOfBirth <= GETDATE ()),
        personRole VARCHAR(50) NOT NULL,
        CONSTRAINT FK_People_ProfilePic FOREIGN KEY (profilePicID) REFERENCES OH_Pictures (PicID)
    );
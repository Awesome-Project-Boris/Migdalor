CREATE TABLE OH_People (
    personID INT IDENTITY(1,1) PRIMARY KEY,
    hebFirstName NVARCHAR(100) NOT NULL,
    hebLastName NVARCHAR(100) NOT NULL,
    engFirstName NVARCHAR(100),
    engLastName NVARCHAR(100),
    profilePicID INT,
    email VARCHAR(2048),
    dateOfBirth DATE,
    CONSTRAINT FK_People_ProfilePic FOREIGN KEY (profilePicID)
        REFERENCES OH_Pictures(PicID)
);

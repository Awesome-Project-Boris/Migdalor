CREATE TABLE OH_Notices (
    noticeID INT IDENTITY(1,1) PRIMARY KEY,
    senderID UNIQUEIDENTIFIER,
    creationDate DATE DEFAULT GETDATE(),
    noticeTitle NVARCHAR(100) NOT NULL,
    noticeMessage NVARCHAR(300),
    noticeCategory NVARCHAR(100),
    noticeSubCategory VARCHAR(100),
    CONSTRAINT FK_Notices_Sender FOREIGN KEY (senderID)
        REFERENCES OH_People(personID),
    CONSTRAINT FK_Notices_Category FOREIGN KEY (noticeCategory)
        REFERENCES OH_Categories(CategoryName)
);

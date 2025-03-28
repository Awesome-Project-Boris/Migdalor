CREATE TABLE OH_Notices (
    noticeID INT IDENTITY(1,1) PRIMARY KEY,
    senderID INT,
    creationDate DATE DEFAULT GETDATE(),
    noticeTitle NVARCHAR(100) NOT NULL,
    noticeMessage NVARCHAR(300),
    noticeCategory NVARCHAR(100),
    noticeSubCategory INT,
    CONSTRAINT FK_Notices_Sender FOREIGN KEY (senderID)
        REFERENCES OH_Residents(residentID),
    CONSTRAINT FK_Notices_Category FOREIGN KEY (noticeCategory)
        REFERENCES OH_Categories(CategoryName)
);

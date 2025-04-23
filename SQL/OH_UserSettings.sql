CREATE TABLE OH_UserSettings (
    userID UNIQUEIDENTIFIER NOT NULL
      CONSTRAINT FK_OH_UserSettings_UserID_People
        FOREIGN KEY REFERENCES OH_People(personID),
    CONSTRAINT PK_OH_UserSettings_UserID
      PRIMARY KEY (userID),

    userSelectedDirection CHAR(3) NOT NULL
      CONSTRAINT DF_OH_UserSettings_Direction
        DEFAULT 'rtl'
      CONSTRAINT CHK_OH_UserSettings_Direction
        CHECK (userSelectedDirection IN ('ltr','rtl')),

    userSelectedFontSize INT NOT NULL
      CONSTRAINT DF_OH_UserSettings_FontSize
        DEFAULT 1
      CONSTRAINT CHK_OH_UserSettings_FontSize
        CHECK (userSelectedFontSize > 0),

    userSelectedLanguage VARCHAR(3) NULL
      CONSTRAINT DF_OH_UserSettings_Language
        DEFAULT 'he'
      CONSTRAINT CHK_OH_UserSettings_Language
        CHECK (userSelectedLanguage IN ('he','en'))
);

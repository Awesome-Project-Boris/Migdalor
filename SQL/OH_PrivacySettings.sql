CREATE TABLE OH_PrivacySettings (
    PersonID UNIQUEIDENTIFIER PRIMARY KEY,
    ShowPartner BIT NOT NULL DEFAULT 1,
    ShowApartmentNumber BIT NOT NULL DEFAULT 1,
    ShowMobilePhone BIT NOT NULL DEFAULT 1,
    ShowEmail BIT NOT NULL DEFAULT 1,
    ShowArrivalYear BIT NOT NULL DEFAULT 1,
    ShowOrigin BIT NOT NULL DEFAULT 1,
    ShowProfession BIT NOT NULL DEFAULT 1,
    ShowInterests BIT NOT NULL DEFAULT 1,
    ShowAboutMe BIT NOT NULL DEFAULT 1,
    ShowProfilePicture BIT NOT NULL DEFAULT 1,
    ShowAdditionalPictures BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_PrivacySettings_People FOREIGN KEY (PersonID) REFERENCES OH_People(PersonID) ON DELETE CASCADE
);
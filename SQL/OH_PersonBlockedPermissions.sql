CREATE TABLE OH_PersonBlockedPermissions (
    personID UNIQUEIDENTIFIER NOT NULL,
    permissionName NVARCHAR(100) NOT NULL,
    PRIMARY KEY (personID, permissionName),
    CONSTRAINT FK_PersonPermissions_Person FOREIGN KEY (personID)
        REFERENCES OH_People(personID),
    CONSTRAINT FK_PersonPermissions_Permission FOREIGN KEY (permissionName)
        REFERENCES OH_Permissions(permissionName)
);

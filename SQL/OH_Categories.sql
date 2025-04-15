CREATE TABLE OH_Categories (
    CategoryName NVARCHAR(100) PRIMARY KEY,
    CategoryColor VARCHAR(7) NOT NULL
        CONSTRAINT CK_CategoryColorFormat
        CHECK (CategoryColor LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
        CONSTRAINT DF_CategoryColorDefault DEFAULT '#FFFFFF',
    CONSTRAINT UQ_CategoryColor UNIQUE (CategoryColor)
);
CREATE TABLE OH_Interests(
interestID int identity(1,1) primary key,
hebName nvarchar(50) unique not null,
engName nvarchar(50) unique not null
);
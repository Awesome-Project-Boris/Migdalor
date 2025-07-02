CREATE TABLE OH_Interests(
interestID int identity(1,1) primary key,
category INT not null references OH_InterestCategories(categoryID),
hebName nvarchar(50) unique not null,
engName nvarchar(50) unique not null
);
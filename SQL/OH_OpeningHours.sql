CREATE TABLE OH_OpeningHours (
    HourID INT IDENTITY(1,1) PRIMARY KEY,
    ServiceID INT NOT NULL,
    DayOfWeek INT NOT NULL, -- 1 for Sunday, 2 for Monday, ..., 7 for Saturday
    OpenTime TIME NOT NULL,
    CloseTime TIME NOT NULL,
    CONSTRAINT FK_Hours_Service FOREIGN KEY (ServiceID) REFERENCES OH_Services(ServiceID),
    CONSTRAINT CK_Hours_DayOfWeek CHECK (DayOfWeek BETWEEN 1 AND 7)
);
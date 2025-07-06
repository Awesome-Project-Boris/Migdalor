CREATE TABLE OH_ScheduleOverrides (
    OverrideID INT IDENTITY(1,1) PRIMARY KEY,
    ServiceID INT NOT NULL,
    OverrideDate DATE NOT NULL,
    IsOpen BIT NOT NULL, -- Is the service open at all on this day?
    OpenTime TIME NULL, -- Null if IsOpen is 0
    CloseTime TIME NULL, -- Null if IsOpen is 0
    Notes NVARCHAR(500) NOT NULL, -- REQUIRED: "Holiday", "Closed for maintenance", "Special event hours"
    CONSTRAINT FK_Overrides_Service FOREIGN KEY (ServiceID) REFERENCES OH_Services(ServiceID)
);
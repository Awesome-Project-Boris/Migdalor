CREATE TABLE OH_Classes (
    classID INT PRIMARY KEY,
    isRecurring BIT DEFAULT 0,
    recurrenceLevel INT NOT NULL,
    recurrenceDetails VARCHAR(MAX),
    sessionAmount INT,
    CONSTRAINT FK_Classes_Activities FOREIGN KEY (classID)
        REFERENCES OH_Activities(activityID)
);

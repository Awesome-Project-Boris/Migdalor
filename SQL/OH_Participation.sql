CREATE TABLE OH_Participation (
    ActivityID INT NOT NULL,
    ParticipantID UNIQUEIDENTIFIER NOT NULL,
    SessionDate DATE NOT NULL,
    
    -- The CHECK constraint is added here to lock the status to one of the four specified values.
    ParticipationStatus NVARCHAR(20) NOT NULL DEFAULT 'Registered' 
        CONSTRAINT CK_Participation_Status CHECK (ParticipationStatus IN ('Registered', 'Attended', 'Absent', 'Cancelled')),
        
    RegistrationDate DATETIME DEFAULT GETDATE(),
    
    PRIMARY KEY (ActivityID, ParticipantID, SessionDate),
    CONSTRAINT FK_Participation_Activity FOREIGN KEY (ActivityID) REFERENCES OH_Activities(ActivityID),
    CONSTRAINT FK_Participation_Person FOREIGN KEY (ParticipantID) REFERENCES OH_People(PersonID)
);
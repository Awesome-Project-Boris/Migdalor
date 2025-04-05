CREATE TABLE OH_Participation (
    activityID INT NOT NULL,
    participantID INT NOT NULL,
    participationDate DATE NOT NULL,
    PRIMARY KEY (activityID, participantID, participationDate),
    CONSTRAINT FK_Participation_Activity FOREIGN KEY (activityID)
        REFERENCES OH_Activities(activityID),
    CONSTRAINT FK_Participation_Participant FOREIGN KEY (participantID)
        REFERENCES OH_People(personID)
);

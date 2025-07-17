-- ==========================================================================================
-- 3. Participation Table (Recreated)
-- This table tracks which participants are registered for a specific Event.
-- It directly links a participant (e.g., a resident) to an event from the [OH_Events] table.
--
-- HOW TO USE THIS TABLE:
--
--  - When a participant signs up for an activity (e.g., "Summer BBQ"):
--    1. Find the correct [EventID] for that activity from the [OH_Events] table.
--    2. Find the participant's ID (e.g., their [residentID]).
--    3. Insert a new record into this table with the [EventID] and [ParticipantID].
--  - The [Status] column can track if they are simply 'Registered' or have 'Attended'.
--  - To get a list of all participants for an activity, you would query:
--    "SELECT * FROM OH_Participation WHERE EventID = @YourEventID"
-- ==========================================================================================
CREATE TABLE [dbo].[OH_Participation] (
    [ParticipationID]   INT IDENTITY(1,1) PRIMARY KEY,
    [EventID]           INT NOT NULL,                   -- Changed from InstanceID to point to the main event
    [ParticipantID]     UNIQUEIDENTIFIER NOT NULL,      -- Links to your 'Residents' or 'Users' table
    [RegistrationTime]  DATETIME2 NOT NULL DEFAULT GETDATE(),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Registered', -- e.g., 'Registered', 'Attended', 'Cancelled'

    -- Defines the foreign key relationship to the OH_Events table.
    CONSTRAINT [FK_Participation_Events] FOREIGN KEY ([EventID])
        REFERENCES [dbo].[OH_Events]([EventID])
        ON DELETE CASCADE, -- If an event is deleted, all its participation records are also deleted.

    -- Example Foreign Key to a residents/users table (uncomment and adapt)
    -- CONSTRAINT [FK_Participation_Residents] FOREIGN KEY ([ParticipantID]) REFERENCES [dbo].[OH_Residents]([residentID]),

    -- Ensures a participant can only register once for any given event.
    CONSTRAINT [UQ_Participation_Event_Participant] UNIQUE ([EventID], [ParticipantID])
);
GO
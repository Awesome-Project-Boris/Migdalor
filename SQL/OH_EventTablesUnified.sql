-- Drop existing tables in the correct order to avoid foreign key constraint issues.
-- Note: You might want to back up your data before running this.
IF OBJECT_ID('dbo.OH_Classes', 'U') IS NOT NULL
    DROP TABLE dbo.OH_Classes;
IF OBJECT_ID('dbo.OH_Activities', 'U') IS NOT NULL
    DROP TABLE dbo.OH_Activities;
-- You may need to drop other tables that have dependencies as well, like OH_Residents, OH_People, OH_Pictures

-- ==========================================================================================
-- 1. Events Table
-- This is the main table for all activities and classes. It defines the "template" for an event.
--
-- HOW TO USE THIS TABLE:
--
--   a) For a ONE-TIME event (e.g., a special guest lecture or activity):
--      - Set [IsRecurring] to 0 (or false).
--      - [StartDate] and [EndDate] will be the actual start and end date/time of the event.
--      - [RecurrenceRule] should be NULL.
--
--   b) For a RECURRING event (e.g., a weekly yoga class):
--      - Set [IsRecurring] to 1 (or true).
--      - [StartDate] is the date of the *first* occurrence.
--      - [EndDate] is the date the entire series concludes.
--      - [RecurrenceRule] stores the pattern (e.g., 'FREQ=WEEKLY;BYDAY=MO').
--      - Your application logic will need to read this rule and generate the individual records
--        in the [OH_EventInstances] table.
-- ==========================================================================================
CREATE TABLE [dbo].[OH_Events] (
    [EventID]              INT IDENTITY(1,1) PRIMARY KEY,
    [EventName]            NVARCHAR(100) NOT NULL,
    [Description]          NVARCHAR(MAX) NULL,
    [HostID]               UNIQUEIDENTIFIER NULL, -- Links to a 'People' or 'Users' table
    [Location]             NVARCHAR(MAX) NULL,
    [PictureID]            INT NULL,              -- Links to a 'Pictures' table
    [Capacity]             INT NULL,

    -- Recurrence Information
    [IsRecurring]          BIT NOT NULL DEFAULT 0,
    [RecurrenceRule]       NVARCHAR(255) NULL,    -- Stores iCalendar RRule strings
    [StartDate]            DATETIME2 NOT NULL,
    [EndDate]              DATETIME2 NULL,        -- For recurring events, the end of the series

    -- Attendance Tracking
    [ParticipationChecked] BIT NOT NULL DEFAULT 0, -- Set to true when an organizer confirms attendance marking is complete

    CONSTRAINT [UQ_Events_EventName] UNIQUE ([EventName])
    -- Example Foreign Key Constraints (uncomment and adapt to your actual table names)
    -- CONSTRAINT [FK_Events_Host] FOREIGN KEY ([HostID]) REFERENCES [dbo].[OH_People]([PersonID]),
    -- CONSTRAINT [FK_Events_Picture] FOREIGN KEY ([PictureID]) REFERENCES [dbo].[OH_Pictures]([PicID])
);
GO

-- ==========================================================================================
-- 2. Event_Instances Table
-- This table stores each individual, concrete occurrence of an event that can be put on a calendar.
-- It is the bridge between an abstract event definition and a real-world session that people can attend.
--
-- HOW TO USE THIS TABLE:
--
--   - This table should be populated by your application logic, NOT directly by users.
--   - When a new record is created in the [Events] table:
--     - If it's a one-time event, create ONE record here with its specific [StartTime] and [EndTime].
--     - If it's a recurring event, parse the [RecurrenceRule] and create a SEPARATE record here for EACH occurrence.
--       For example, a class that runs every Monday for 8 weeks will result in 8 records in this table.
--   - To build your calendar view, you will query THIS table. For example:
--     "SELECT * FROM Event_Instances WHERE StartTime >= '2025-07-01' AND StartTime < '2025-08-01'"
--     This makes calendar queries extremely fast and simple.
-- ==========================================================================================
CREATE TABLE [dbo].[OH_EventInstances] (
    [InstanceID]    INT IDENTITY(1,1) PRIMARY KEY,
    [EventID]       INT NOT NULL,
    [StartTime]     DATETIME2 NOT NULL,
    [EndTime]       DATETIME2 NOT NULL,
    -- Add these two new columns
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- e.g., 'Scheduled', 'Cancelled', 'Postponed'
    [Notes]         NVARCHAR(500) NULL, -- Optional: For explaining the change, e.g., "Cancelled due to instructor illness."

    CONSTRAINT [FK_EventInstances_Events] FOREIGN KEY ([EventID])
        REFERENCES [dbo].[Events]([EventID])
        ON DELETE CASCADE
);

-- ==========================================================================================
-- 3. Participation Table
-- This table tracks which participants are registered for a specific Event. It is primarily
-- used for one-time activities where attendance is marked against the event itself.
--
-- HOW TO USE THIS TABLE:
--
--   - When a participant signs up for an activity (e.g., "Summer BBQ"):
--     1. Find the correct [EventID] for that activity from the [OH_Events] table.
--     2. Find the participant's ID.
--     3. Insert a new record into this table with the [EventID] and [ParticipantID].
--   - The [Status] column can track if they are 'Registered', 'Attended', 'Absent', etc.
--   - To get a list of all participants for an activity, you would query:
--     "SELECT * FROM OH_Participation WHERE EventID = @YourEventID"
-- ==========================================================================================
CREATE TABLE [dbo].[OH_Participation] (
    [ParticipationID]   INT IDENTITY(1,1) PRIMARY KEY,
    [EventID]           INT NOT NULL,                   -- Links to the main event
    [ParticipantID]     UNIQUEIDENTIFIER NOT NULL,      -- Links to your 'Residents' or 'Users' table
    [RegistrationTime]  DATETIME2 NOT NULL DEFAULT GETDATE(),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Registered', -- e.g., 'Registered', 'Attended', 'Absent', 'Cancelled'

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

-- ==========================================================================================
-- 4. Event_Registrations Table
-- This table tracks which participants are registered for a recurring event series (the "core members").
-- It links a participant directly to an 'Event' template.
--
-- HOW TO USE THIS TABLE:
--
--  - When a resident decides to join a weekly class (e.g., "Weekly Yoga"):
--    1. Your application will create ONE record in this table, linking the resident's ID
--       to the 'Weekly Yoga' EventID.
--    2. This signifies they are enrolled in the entire series.
--
--  - To get a list of all registered members for a class, you would query:
--    "SELECT * FROM Event_Registrations WHERE EventID = @YourEventID AND Status = 'Active'"
--
--  - If a member drops the class, you simply update their record's [Status] to 'Cancelled'
--    or delete the record. This is much cleaner than managing dozens of 'Attendance' records.
-- ==========================================================================================
CREATE TABLE [dbo].[OH_EventRegistrations] (
    [RegistrationID]   INT IDENTITY(1,1) PRIMARY KEY,
    [EventID]          INT NOT NULL,
    [ParticipantID]    UNIQUEIDENTIFIER NOT NULL, -- Links to your 'Residents' or 'Users' table
    [RegistrationDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [Status]           NVARCHAR(50) NOT NULL DEFAULT 'Active', -- e.g., 'Active', 'Cancelled', 'Waitlisted'

    -- Foreign key to the main Events table.
    CONSTRAINT [FK_EventRegistrations_Events] FOREIGN KEY ([EventID])
        REFERENCES [dbo].[OH_Events]([EventID])
        ON DELETE CASCADE, -- If the event is deleted, all registrations are automatically removed.

    -- Example Foreign Key to a residents/users table (uncomment and adapt)
    -- CONSTRAINT [FK_EventRegistrations_Residents] FOREIGN KEY ([ParticipantID]) REFERENCES [dbo].[OH_Residents]([residentID]),

    -- Ensures a participant can only register for the same event once.
    CONSTRAINT [UQ_Registration_Event_Participant] UNIQUE ([EventID], [ParticipantID])
);
GO
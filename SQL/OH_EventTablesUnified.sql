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
-- It combines the original OH_Activities and OH_Classes tables into a single, more flexible structure.
--
-- HOW TO USE THIS TABLE:
--
--   a) For a ONE-TIME event (e.g., a special guest lecture):
--      - Set [IsRecurring] to 0 (or false).
--      - [StartDate] will be the actual date and time of the event.
--      - [EndDate] can be NULL or the same as [StartDate].
--      - [RecurrenceRule] should be NULL.
--      - Your application should then create a single corresponding record in the [Event_Instances] table.
--
--   b) For a RECURRING event (e.g., a weekly yoga class):
--      - Set [IsRecurring] to 1 (or true).
--      - [StartDate] is the date of the *first* occurrence.
--      - [EndDate] is the date the entire series concludes.
--      - [RecurrenceRule] stores the pattern. Use the iCalendar standard (RFC 5545) RRule format.
--        Examples:
--        - 'FREQ=WEEKLY;BYDAY=MO' -> Every Monday.
--        - 'FREQ=DAILY;COUNT=10' -> Every day for 10 occurrences.
--        - 'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1' -> The last Friday of every month.
--      - Your application logic will need to read this rule and generate the individual records in the [Event_Instances] table.
-- ==========================================================================================
CREATE TABLE [dbo].[OH_Events] (
    [EventID]          INT IDENTITY(1,1) PRIMARY KEY,
    [EventName]        NVARCHAR(100) NOT NULL,
    [Description]      NVARCHAR(MAX) NULL,
    [HostID]           UNIQUEIDENTIFIER NULL, -- Assuming this links to a 'People' or 'Users' table
    [Location]         NVARCHAR(MAX) NULL,
    [PictureID]        INT NULL, -- Assuming this links to a 'Pictures' table
    [Capacity]         INT NOT NULL,

    -- Recurrence Information
    [IsRecurring]      BIT NOT NULL DEFAULT 0,
    [RecurrenceRule]   NVARCHAR(255) NULL, -- Can store iCalendar RRule strings (e.g., 'FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20251231T235959Z')
    [StartDate]        DATETIME2 NOT NULL,
    [EndDate]          DATETIME2 NULL, -- For recurring events, this would be the end of the series

    CONSTRAINT [UQ_Events_EventName] UNIQUE ([EventName]),
    -- Example Foreign Key Constraints (uncomment and adapt to your actual table names)
    -- CONSTRAINT [FK_Events_Host] FOREIGN KEY ([HostID]) REFERENCES [dbo].[OH_People]([PersonID]),
    -- CONSTRAINT [FK_Events_Picture] FOREIGN KEY ([PictureID]) REFERENCES [dbo].[OH_Pictures]([PicID])
);

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
-- 3. Attendance Table
-- This table tracks who attended which specific event instance.
-- It directly links a participant (e.g., a resident) to a session from the [Event_Instances] table.
--
-- HOW TO USE THIS TABLE:
--
--   - When a participant signs in or registers for a specific session (e.g., the Yoga class on July 14th):
--     1. Find the correct [InstanceID] for that session from the [Event_Instances] table.
--     2. Find the participant's ID (e.g., their [residentID]).
--     3. Insert a new record into this table with the [InstanceID] and [ParticipantID].
--   - [SignInTime] records the exact moment they were marked as present.
--   - The [Status] column is flexible. You can use it to track:
--     - 'Registered': The person has signed up but not yet attended.
--     - 'Attended': The person was present.
--     - 'Absent': The person was registered but did not show up.
--     - 'Cancelled': The person cancelled their registration.
--   - To get a list of all attendees for a specific class session, you would query:
--     "SELECT * FROM Attendance WHERE InstanceID = @YourInstanceID"
-- ==========================================================================================
CREATE TABLE [dbo].[OH_Participation] (
    [AttendanceID]     INT IDENTITY(1,1) PRIMARY KEY,
    [InstanceID]       INT NOT NULL,
    [ParticipantID]    UNIQUEIDENTIFIER NOT NULL, -- Assuming this links to your 'Residents' or 'Users' table
    [SignInTime]       DATETIME2 NULL,
    [Status]           NVARCHAR(50) NOT NULL DEFAULT 'Attended' -- e.g., 'Attended', 'Absent', 'Cancelled'

    -- Defines the foreign key relationship to the Event_Instances table.
    CONSTRAINT [FK_Attendance_EventInstances] FOREIGN KEY ([InstanceID])
        REFERENCES [dbo].[OH_Event_Instances]([InstanceID])
        ON DELETE CASCADE, -- If an event instance is deleted, the attendance record is also deleted.

    -- Example Foreign Key to a residents/users table (uncomment and adapt)
    -- CONSTRAINT [FK_Attendance_Residents] FOREIGN KEY ([ParticipantID]) REFERENCES [dbo].[OH_Residents]([residentID]),

    -- Ensures a participant can only be marked once for any given event instance.
    CONSTRAINT [UQ_Attendance_Instance_Participant] UNIQUE ([InstanceID], [ParticipantID])
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
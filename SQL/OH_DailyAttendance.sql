-- This script creates the OH_DailyAttendance table with all necessary constraints.

CREATE TABLE [dbo].[OH_BokerTov] (
    -- Primary Key for the table, automatically increments.
    [Id]             INT           IDENTITY (1, 1) NOT NULL,

    -- Foreign key linking to the resident in the OH_Residents table.
    [ResidentId]     UNIQUEIDENTIFIER           NOT NULL,

    -- The specific date for this attendance record.
    [AttendanceDate] DATE          NOT NULL,

    -- A simple flag (0 or 1) to check if the resident has signed in.
    [HasSignedIn]    BIT           NOT NULL,

    -- The exact timestamp when the resident signed in. Null if they haven't.
    [SignInTime]     DATETIME2 (7) NULL,

    -- Defines the primary key constraint on the 'Id' column.
    CONSTRAINT [PK_OH_DailyAttendance] PRIMARY KEY CLUSTERED ([Id] ASC),

    -- Defines the foreign key relationship to the OH_Residents table.
    -- If a resident is deleted, their attendance records are also deleted.
    CONSTRAINT [FK_OH_DailyAttendance_OH_Residents] FOREIGN KEY ([ResidentId]) REFERENCES [dbo].[OH_Residents] ([residentID]) ON DELETE CASCADE,

    -- Creates a unique index to ensure a resident can only have one
    -- attendance record per day, preventing duplicate entries.
    CONSTRAINT [UQ_OH_DailyAttendance_ResidentDate] UNIQUE NONCLUSTERED ([residentID], [AttendanceDate] ASC)
);
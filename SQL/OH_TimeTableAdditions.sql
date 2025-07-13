CREATE TABLE [dbo].[OH_TimeTableAdditions](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NOT NULL,
    [Description] [nvarchar](max) NULL,
    [Location] [nvarchar](255) NULL,
    [StartTime] [datetime2](7) NOT NULL,
    [EndTime] [datetime2](7) NOT NULL,
    [Type] [nvarchar](100) NULL,
    [DateAdded] [datetime2] NOT NULL DEFAULT GETDATE(),
);
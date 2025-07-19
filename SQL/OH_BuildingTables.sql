-- =================================================================
-- Table for storing building information
-- =================================================================
CREATE TABLE [dbo].[OH_Buildings](
	[BuildingID] [uniqueidentifier] NOT NULL,
	[BuildingName] [nvarchar](100) NOT NULL,
	[Info] [nvarchar](max) NULL,
	[Coordinates] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED
(
	[BuildingID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- =================================================================
-- Table for storing individual apartment details
-- =================================================================
CREATE TABLE [dbo].[OH_Apartments](
	[ApartmentNumber] [uniqueidentifier] NOT NULL,
	[PhysicalBuildingID] [uniqueidentifier] NOT NULL,
	[AccessBuildingID] [uniqueidentifier] NOT NULL,
	[FloorNumber] [int] NULL,
	[ApartmentName] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[ApartmentNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[OH_Apartments]  WITH CHECK ADD  CONSTRAINT [FK_Apartments_AccessBuilding] FOREIGN KEY([AccessBuildingID])
REFERENCES [dbo].[OH_Buildings] ([BuildingID])
GO

ALTER TABLE [dbo].[OH_Apartments] CHECK CONSTRAINT [FK_Apartments_AccessBuilding]
GO

ALTER TABLE [dbo].[OH_Apartments]  WITH CHECK ADD  CONSTRAINT [FK_Apartments_PhysicalBuilding] FOREIGN KEY([PhysicalBuildingID])
REFERENCES [dbo].[OH_Buildings] ([BuildingID])
GO

ALTER TABLE [dbo].[OH_Apartments] CHECK CONSTRAINT [FK_Apartments_PhysicalBuilding]
GO

-- =================================================================
-- Table for storing map navigation nodes
-- =================================================================
CREATE TABLE [dbo].[OH_MapNodes](
	[NodeID] [int] NOT NULL,
	[Longitude] [float] NOT NULL,
	[Latitude] [float] NOT NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED
(
	[NodeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- =================================================================
-- Linking table for Buildings and their multiple entrance nodes
-- =================================================================
CREATE TABLE [dbo].[OH_BuildingEntrances](
	[BuildingID] [uniqueidentifier] NOT NULL,
	[NodeID] [int] NOT NULL,
 CONSTRAINT [PK_BuildingEntrances] PRIMARY KEY CLUSTERED
(
	[BuildingID] ASC,
	[NodeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[OH_BuildingEntrances]  WITH CHECK ADD  CONSTRAINT [FK_BuildingEntrances_Buildings] FOREIGN KEY([BuildingID])
REFERENCES [dbo].[OH_Buildings] ([BuildingID])
GO

ALTER TABLE [dbo].[OH_BuildingEntrances] CHECK CONSTRAINT [FK_BuildingEntrances_Buildings]
GO

ALTER TABLE [dbo].[OH_BuildingEntrances]  WITH CHECK ADD  CONSTRAINT [FK_BuildingEntrances_MapNodes] FOREIGN KEY([NodeID])
REFERENCES [dbo].[OH_MapNodes] ([NodeID])
GO

ALTER TABLE [dbo].[OH_BuildingEntrances] CHECK CONSTRAINT [FK_BuildingEntrances_MapNodes]
GO
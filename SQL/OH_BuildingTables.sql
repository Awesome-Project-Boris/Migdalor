-- =================================================================
-- Table for storing building information
-- =================================================================
CREATE TABLE Buildings (
    -- A unique identifier for the building, e.g., 'B1', 'B2', etc.
    -- This is the Primary Key for this table.
    BuildingID VARCHAR(10) NOT NULL PRIMARY KEY,

    -- The common name of the building, e.g., 'West Wing'.
    Name NVARCHAR(100) NOT NULL,

    -- Any additional information or description for the building.
    Info NVARCHAR(MAX) NULL,

    -- A JSON string containing the array of latitude/longitude pairs
    -- that define the building's footprint on the map.
    Coordinates NVARCHAR(MAX) NULL
);
GO

-- =================================================================
-- Table for storing individual apartment details
-- =================================================================
CREATE TABLE Apartments (
    -- The unique number for the apartment, e.g., '101', '432A'.
    -- This is the Primary Key for this table.
    ApartmentNumber VARCHAR(10) NOT NULL PRIMARY KEY,

    -- The ID of the building where the apartment is physically located.
    -- This is a Foreign Key that links to the Buildings table.
    PhysicalBuildingID VARCHAR(10) NOT NULL,

    -- The ID of the building that must be entered to access the apartment.
    -- This handles cases where the entrance is in a different building.
    -- This is a Foreign Key that links to the Buildings table.
    AccessBuildingID VARCHAR(10) NOT NULL,

    -- The ID of the resident living in the apartment.
    -- This is a Foreign Key that links to your existing OH_Residents table.
    -- It is NULLABLE, so a NULL value indicates the apartment is vacant.
    ResidentID INT NULL,

    -- --- CONSTRAINTS ---
    -- Defines the foreign key relationship to the Buildings table for PhysicalBuildingID
    CONSTRAINT FK_Apartments_PhysicalBuilding
        FOREIGN KEY (PhysicalBuildingID) REFERENCES Buildings(BuildingID),

    -- Defines the foreign key relationship to the Buildings table for AccessBuildingID
    CONSTRAINT FK_Apartments_AccessBuilding
        FOREIGN KEY (AccessBuildingID) REFERENCES Buildings(BuildingID),

    -- Defines the foreign key relationship to the OH_Residents table
    -- IMPORTANT: Make sure your residents table is named OH_Residents and its primary key is ResidentID.
    -- If not, you will need to adjust this line.
    CONSTRAINT FK_Apartments_Residents
        FOREIGN KEY (ResidentID) REFERENCES OH_Residents(ResidentID)
);
GO

-- =================================================================
-- Linking table for Buildings and their multiple entrance nodes
-- This allows one building to have many entrance nodes.
-- =================================================================
CREATE TABLE BuildingEntrances (
    -- Foreign key linking to the Buildings table.
    BuildingID VARCHAR(10) NOT NULL,

    -- The ID of the navigation node that serves as an entrance.
    -- This does not have a foreign key constraint, as the nodes
    -- are currently managed on the client side.
    NodeID INT NOT NULL,

    -- --- CONSTRAINTS ---
    -- The Primary Key is a combination of BuildingID and NodeID to ensure
    -- that the same node cannot be assigned to the same building twice.
    CONSTRAINT PK_BuildingEntrances PRIMARY KEY (BuildingID, NodeID),

    -- Defines the foreign key relationship to the Buildings table.
    CONSTRAINT FK_BuildingEntrances_Buildings
        FOREIGN KEY (BuildingID) REFERENCES Buildings(BuildingID)
);
GO
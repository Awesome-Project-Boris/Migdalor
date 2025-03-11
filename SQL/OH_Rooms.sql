CREATE TABLE OH_Rooms (
    roomNumber INT NOT NULL,
    buildingNumber INT NOT NULL,
    roomName NVARCHAR(100),
    capacity INT NOT NULL,
    PRIMARY KEY (roomNumber, buildingNumber)
);

-- Insert data into OH_Pictures
INSERT INTO OH_Pictures (picName, picPath, picAlt) VALUES
('Picture1', '/images/pic1.jpg', 'Alt text for picture 1'),
('Picture2', '/images/pic2.jpg', 'Alt text for picture 2'),
('Picture3', '/images/pic3.jpg', 'Alt text for picture 3');

-- Insert data into OH_Permissions
INSERT INTO OH_Permissions (permissionName) VALUES
('View'),
('Edit'),
('Delete');

-- Insert data into OH_Categories
INSERT INTO OH_Categories (CategoryName) VALUES
('General'),
('Urgent'),
('Announcement');

-- Insert data into OH_People
INSERT INTO OH_People (hebFirstName, hebLastName, engFirstName, engLastName, gender, profilePicID, email, dateOfBirth) VALUES
(N'יעקב', N'כהן', 'Jacob', 'Cohen', 'M', 1, 'jacob@example.com', '1980-01-15'),
(N'שרה', N'לוי', 'Sarah', 'Levy', 'F', 2, 'sarah@example.com', '1985-05-20'),
(N'אבי', N'ברק', 'Avi', 'Barak', 'M', 3, 'avi@example.com', '1990-09-10');

-- Insert data into OH_Residents
INSERT INTO OH_Residents 
    (residentID, hasLoggedIn, isActive, branchName, isBokerTov, canInitActivity, spouseID, dateOfArrival, homePlace, phoneNumber, profession, residentDescription, additionalPic1ID, additionalPic2ID)
VALUES
    (1, 1, 1, N'Main Branch', 1, 1, 2, '2020-01-01', N'City A', '1234567890', N'Engineer', N'Resident description for Jacob', 1, 2),
    (2, 0, 1, N'Main Branch', 1, 0, 1, '2021-06-15', N'City B', '0987654321', N'Doctor', N'Resident description for Sarah', 2, 3);

-- Insert data into OH_Classes
INSERT INTO OH_Classes 
    (activityName, startDate, capacity, hostID, [location], PicID, isRecurring, recurrenceLevel, recurrenceDetails, sessionAmount)
VALUES
    (N'Yoga Class', '2025-04-10 10:00:00', 20, 1, N'Room 101', 1, 1, 1, 'Weekly on Mondays', 10),
    (N'Cooking Workshop', '2025-05-05 14:00:00', 15, 2, N'Kitchen', 2, 0, 0, '', 1);

-- Insert data into OH_Activities
INSERT INTO OH_Activities 
    (activityName, startDate, capacity, hostID, [location], PicID)
VALUES
    (N'Art Class', '2025-04-15 09:00:00', 25, 3, N'Art Studio', 3),
    (N'Music Lesson', '2025-04-20 16:00:00', 10, 1, N'Music Room', 1);

-- Insert data into OH_Notices
INSERT INTO OH_Notices 
    (senderID, creationDate, noticeTitle, noticeMessage, noticeCategory, noticeSubCategory)
VALUES
    (1, '2025-03-01', N'Maintenance Update', N'The elevator will be under maintenance tomorrow.', 'General', 1),
    (2, '2025-03-05', N'Event Cancellation', N'The cooking workshop has been cancelled.', 'Urgent', 2);

-- Insert data into OH_Rooms
INSERT INTO OH_Rooms (roomNumber, buildingNumber, roomName, capacity)
VALUES
    (101, 1, N'Conference Room', 30),
    (102, 1, N'Meeting Room', 15);

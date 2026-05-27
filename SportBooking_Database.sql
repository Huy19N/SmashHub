CREATE DATABASE SmashClub;
GO
USE SmashClub;
GO

-- ==========================================
-- 1. SYSTEM & USER MODULE
-- ==========================================
CREATE TABLE UserRoles (
    RoleId INT NOT NULL,
    RoleName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_UserRoles PRIMARY KEY (RoleId)
);

CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER DEFAULT NEWID(),
    RoleId INT NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL, 
    PhoneNumber NVARCHAR(20),
    CreatedAt DATETIME CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),
    LastPwdChange DATETIME NOT NULL DEFAULT GETDATE(),
    IsActive BIT CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CONSTRAINT PK_Users PRIMARY KEY (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_RoleId FOREIGN KEY (RoleId) REFERENCES UserRoles(RoleId)
);

CREATE TABLE RefreshTokens (
    RefreshTokenId UNIQUEIDENTIFIER DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Token VARCHAR(255) NOT NULL,
    JwtId VARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    ExpiredAt DATETIME NOT NULL,
    IsActive BIT CONSTRAINT DF_RefreshTokens_IsActive DEFAULT 1 NOT NULL,
    IPAddress NVARCHAR(255),
    UserAgent NVARCHAR(MAX),
    CONSTRAINT PK_RefreshTokens PRIMARY KEY (RefreshTokenId),
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token)
);

-- ==========================================
-- 2. SPORT & PROFILE MODULE
-- ==========================================
CREATE TABLE Sports (
    SportId INT IDENTITY(1,1),
    SportName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    CONSTRAINT PK_Sports PRIMARY KEY (SportId),
    CONSTRAINT UQ_Sports_SportName UNIQUE (SportName)
);

CREATE TABLE SportLevels (
    LevelId INT IDENTITY(1,1),
    SportId INT NOT NULL,
    LevelName NVARCHAR(50) NOT NULL, 
    RankValue INT NOT NULL, 
    CONSTRAINT PK_SportLevels PRIMARY KEY (LevelId),
    CONSTRAINT FK_SportLevels_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId) ON DELETE CASCADE
);

CREATE TABLE UserSportProfiles (
    ProfileId UNIQUEIDENTIFIER DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    SportId INT NOT NULL,
    LevelId INT NOT NULL,
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_UserSportProfiles PRIMARY KEY (ProfileId),
    CONSTRAINT FK_UserSportProfiles_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserSportProfiles_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId),
    CONSTRAINT FK_UserSportProfiles_Levels FOREIGN KEY (LevelId) REFERENCES SportLevels(LevelId),
    CONSTRAINT UQ_User_Sport UNIQUE (UserId, SportId) -- 1 user chỉ có 1 trình độ cho 1 môn
);

-- ==========================================
-- 3. TEAM MODULE
-- ==========================================
CREATE TABLE TeamRoles (
    TeamRoleId INT NOT NULL,
    RoleName NVARCHAR(50) NOT NULL, -- e.g., Leader, Co-Leader, Member
    CONSTRAINT PK_TeamRoles PRIMARY KEY (TeamRoleId)
);

CREATE TABLE Teams (
    TeamId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1 NOT NULL,
    CONSTRAINT PK_Teams PRIMARY KEY (TeamId)
    -- Không lưu SportId ở đây để Team có thể chơi nhiều môn
);

CREATE TABLE TeamMembers (
    TeamId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    TeamRoleId INT NOT NULL,
    Wins INT DEFAULT 0 NOT NULL,   
    Losses INT DEFAULT 0 NOT NULL, 
    JoinedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_TeamMembers PRIMARY KEY (TeamId, UserId),
    CONSTRAINT FK_TeamMembers_Teams FOREIGN KEY (TeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamMembers_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamMembers_TeamRoles FOREIGN KEY (TeamRoleId) REFERENCES TeamRoles(TeamRoleId)
);

CREATE TABLE TeamInvites (
    InviteId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamId UNIQUEIDENTIFIER NOT NULL,
    CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
    InviteToken VARCHAR(100) NOT NULL UNIQUE, 
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiredAt DATETIME NOT NULL,
    MaxUses INT DEFAULT 1, 
    CurrentUses INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CONSTRAINT PK_TeamInvites PRIMARY KEY (InviteId),
    CONSTRAINT FK_TeamInvites_Teams FOREIGN KEY (TeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamInvites_Users FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId)
);

-- ==========================================
-- 4. SCHEDULING MODULE
-- ==========================================
CREATE TABLE Schedules (
    ScheduleId UNIQUEIDENTIFIER DEFAULT NEWID(),
    HostTeamId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    SportId INT NOT NULL, -- Quyết định bộ môn trực tiếp tại lúc tạo lịch
    Location NVARCHAR(255) NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    MaxParticipants INT NOT NULL,
    TotalCost DECIMAL(18,2) DEFAULT 0, 
    CostNote NVARCHAR(MAX),            
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Schedules PRIMARY KEY (ScheduleId),
    CONSTRAINT FK_Schedules_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId),
    CONSTRAINT FK_Schedules_HostTeam FOREIGN KEY (HostTeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT CK_Schedules_MaxParticipants CHECK (MaxParticipants > 0)
);

CREATE TABLE ScheduleParticipants (
    ScheduleId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    IsAttended BIT DEFAULT 0 NOT NULL, -- Leader dùng để điểm danh
    JoinedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_ScheduleParticipants PRIMARY KEY (ScheduleId, UserId),
    CONSTRAINT FK_ScheduleParticipants_Schedules FOREIGN KEY (ScheduleId) REFERENCES Schedules(ScheduleId) ON DELETE CASCADE,
    CONSTRAINT FK_ScheduleParticipants_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
GO

----Data----
USE SmashClub;
GO

-- ==========================================
-- 1. THÊM DỮ LIỆU DANH MỤC (ROLES & SPORTS)
-- ==========================================

-- Thêm User Roles (Hệ thống)
INSERT INTO UserRoles (RoleId, RoleName) 
VALUES 
    (1, N'Admin'),
    (2, N'User');

-- Thêm Team Roles (Đội nhóm)
INSERT INTO TeamRoles (TeamRoleId, RoleName) 
VALUES 
    (1, N'Leader'),
    (2, N'Member');

-- Thêm Bộ môn thể thao
-- Lưu ý: SportId tự động tăng (IDENTITY 1, 2)
INSERT INTO Sports (SportName, Description) 
VALUES 
    (N'Cầu Lông', N'Sân thảm tiêu chuẩn'),       -- SportId = 1
    (N'Bóng Bàn', N'Bàn thi đấu quốc tế');      -- SportId = 2

-- Thêm Trình độ cho từng bộ môn
-- Lưu ý: LevelId tự động tăng (IDENTITY 1, 2, 3...)
INSERT INTO SportLevels (SportId, LevelName, RankValue) 
VALUES 
    (1, N'Cơ bản', 1),     -- Cầu lông (LevelId = 1)
    (1, N'Nâng cao', 2),   -- Cầu lông (LevelId = 2)
    (1, N'Tuyển thủ', 3),  -- Cầu lông (LevelId = 3)
    (2, N'Cơ bản', 1),     -- Bóng bàn (LevelId = 4)
    (2, N'Nghiệp dư', 2),  -- Bóng bàn (LevelId = 5)
    (2, N'Tuyển thủ', 3);  -- Bóng bàn (LevelId = 6)

GO

-- ==========================================
-- 2. THÊM DỮ LIỆU NGƯỜI DÙNG & TEAM (Dùng Biến)
-- ==========================================
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
DECLARE @User1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @User2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @TeamId UNIQUEIDENTIFIER = NEWID();

-- Thêm Users
INSERT INTO Users (UserId, RoleId, FullName, Email, Password, PhoneNumber) 
VALUES 
    (@AdminId, 1, N'Quản Trị Viên', 'admin@smashclub.com', 'hashed_password_here', '0999999999'),
    (@User1Id, 2, N'Nguyễn Văn A', 'nguyenvana@gmail.com', 'hashed_password_here', '0912345678'),
    (@User2Id, 2, N'Trần Thị B', 'tranthib@gmail.com', 'hashed_password_here', '0987654321');

-- Thêm Hồ sơ trình độ cho User 1 (Đúng như ví dụ của bạn)
INSERT INTO UserSportProfiles (UserId, SportId, LevelId) 
VALUES 
    (@User1Id, 1, 1), -- Môn 1 (Cầu lông), Trình độ 1 (Cơ bản)
    (@User1Id, 2, 6); -- Môn 2 (Bóng bàn), Trình độ 6 (Tuyển thủ)

-- Thêm Hồ sơ trình độ cho User 2
INSERT INTO UserSportProfiles (UserId, SportId, LevelId) 
VALUES 
    (@User2Id, 1, 2); -- Môn 1 (Cầu lông), Trình độ 2 (Nâng cao)

-- Thêm Team mới
INSERT INTO Teams (TeamId, TeamName, Description) 
VALUES 
    (@TeamId, N'Smashers Hanoi', N'CLB giao lưu cầu lông và bóng bàn khu vực Cầu Giấy');

-- Thêm Thành viên vào Team
INSERT INTO TeamMembers (TeamId, UserId, TeamRoleId, Wins, Losses) 
VALUES 
    (@TeamId, @User1Id, 1, 10, 2), -- User 1 là Leader (TeamRoleId = 1)
    (@TeamId, @User2Id, 2, 5, 5);  -- User 2 là Member (TeamRoleId = 2)

-- Tạo một lịch chơi mẫu cho Team
DECLARE @ScheduleId UNIQUEIDENTIFIER = NEWID();
INSERT INTO Schedules (ScheduleId, HostTeamId, Title, SportId, Location, StartTime, EndTime, MaxParticipants, TotalCost, CostNote)
VALUES 
    (@ScheduleId, @TeamId, N'Giao lưu cầu lông cuối tuần', 1, N'Sân cầu lông Bách Khoa', 
     DATEADD(day, 2, GETDATE()), DATEADD(day, 2, DATEADD(hour, 2, GETDATE())), 
     10, 500000, N'Tiền sân 300k, tiền cầu 200k');

-- Đăng ký và điểm danh cho User 1 vào lịch chơi trên
INSERT INTO ScheduleParticipants (ScheduleId, UserId, IsAttended)
VALUES 
    (@ScheduleId, @User1Id, 1); -- Đã điểm danh (IsAttended = 1)

GO
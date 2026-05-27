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
    SportId INT NOT NULL,
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
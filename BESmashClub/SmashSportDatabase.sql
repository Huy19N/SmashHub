USE master;
GO

DROP DATABASE IF EXISTS SmashClub;
GO

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
    SportId INT NOT NULL,
    RankValue INT NOT NULL, 
    LevelName NVARCHAR(50) NOT NULL, 
    CONSTRAINT PK_SportLevels PRIMARY KEY (SportId, RankValue),
    CONSTRAINT FK_SportLevels_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId) ON DELETE CASCADE
);

CREATE TABLE UserSportProfiles (
    UserId UNIQUEIDENTIFIER NOT NULL,
    SportId INT NOT NULL,
    RankValue INT NOT NULL, 
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_UserSportProfiles PRIMARY KEY (UserId, SportId),
    CONSTRAINT FK_UserSportProfiles_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserSportProfiles_SportLevels FOREIGN KEY (SportId, RankValue) REFERENCES SportLevels(SportId, RankValue)
);

-- ==========================================
-- 3. TEAM MODULE
-- ==========================================
CREATE TABLE TeamRoles (
    TeamRoleId INT NOT NULL,
    RoleName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_TeamRoles PRIMARY KEY (TeamRoleId)
);

CREATE TABLE Teams (
    TeamId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1 NOT NULL,
    CONSTRAINT PK_Teams PRIMARY KEY (TeamId)
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
-- 4. FACILITY & COURT MODULE
-- ==========================================
CREATE TABLE Facilities(
    FacilityId INT IDENTITY(1,1),
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL,
    District NVARCHAR(50) NOT NULL,
    [Address] NVARCHAR(255),
    [Location] GEOGRAPHY,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Facilities PRIMARY KEY (FacilityId),
    CONSTRAINT FK_Facilities_Users FOREIGN KEY (OwnerId) REFERENCES Users(UserId)
);

CREATE TABLE CourtStatus(
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50),
    CONSTRAINT PK_CourtStatus PRIMARY KEY (StatusId)
);

CREATE TABLE Courts(
    CourtId INT IDENTITY(1,1),
    FacilityId INT NOT NULL,
    SportId INT NOT NULL,
    CourtName NVARCHAR(50) NOT NULL,
    StatusId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_Courts PRIMARY KEY (CourtId),
    CONSTRAINT FK_Courts_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId),
    CONSTRAINT FK_Courts_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId),
    CONSTRAINT FK_Courts_CourtStatus FOREIGN KEY (StatusId) REFERENCES CourtStatus(StatusId)
);

CREATE TABLE CourtCosts(
    CourtCostId INT IDENTITY(1,1),
    FacilityId INT NOT NULL,
    CourtId INT NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    DurationMinutes INT NOT NULL, -- Đã sửa: Chuyển từ TIME sang INT để tính phút
    Cost MONEY NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_CourtCosts PRIMARY KEY (CourtCostId, FacilityId),
    CONSTRAINT FK_CourtCosts_Courts FOREIGN KEY (CourtId) REFERENCES Courts(CourtId)
);

-- ==========================================
-- 5. BOOKING MODULE
-- ==========================================
CREATE TABLE BookingStatus (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_BookingStatus PRIMARY KEY (StatusId)
);

CREATE TABLE Bookings (
    BookingId UNIQUEIDENTIFIER DEFAULT NEWID(),
    CourtId INT NOT NULL,
    BookedByUserId UNIQUEIDENTIFIER NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    TotalCost DECIMAL(18,2) DEFAULT 0,
    StatusId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Bookings PRIMARY KEY (BookingId),
    CONSTRAINT FK_Bookings_Courts FOREIGN KEY (CourtId) REFERENCES Courts(CourtId),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (BookedByUserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Bookings_BookingStatus FOREIGN KEY (StatusId) REFERENCES BookingStatus(StatusId)
);

-- ==========================================
-- 6. SCHEDULING MODULE
-- ==========================================
CREATE TABLE Schedules (
    ScheduleId UNIQUEIDENTIFIER DEFAULT NEWID(),
    HostTeamId UNIQUEIDENTIFIER NOT NULL,
    BookingId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    MaxParticipants INT NOT NULL,
    CostPerPerson DECIMAL(18,2) DEFAULT 0, 
    CostNote NVARCHAR(MAX),            
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Schedules PRIMARY KEY (ScheduleId),
    CONSTRAINT FK_Schedules_HostTeam FOREIGN KEY (HostTeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_Schedules_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT CK_Schedules_MaxParticipants CHECK (MaxParticipants > 0)
);

CREATE TABLE ScheduleParticipants (
    ScheduleId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    IsAttended BIT DEFAULT 0 NOT NULL,
    JoinedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_ScheduleParticipants PRIMARY KEY (ScheduleId, UserId),
    CONSTRAINT FK_ScheduleParticipants_Schedules FOREIGN KEY (ScheduleId) REFERENCES Schedules(ScheduleId) ON DELETE CASCADE,
    CONSTRAINT FK_ScheduleParticipants_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

-- ==========================================
-- 7. EMAIL MODULE
-- ==========================================
CREATE TABLE EmailConfirms(
    Code UNIQUEIDENTIFIER DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
    ExpiredAt DATETIME NOT NULL,
    CONSTRAINT PK_EmailConfirms PRIMARY KEY (Code, Email)
);

-- ==========================================
-- 8. SUBSCRIPTION MODULE
-- ==========================================
CREATE TABLE SubscriptionTiers (
    TierId INT IDENTITY(1,1),
    TierName NVARCHAR(50) NOT NULL, 
    Description NVARCHAR(MAX),
    CONSTRAINT PK_SubscriptionTiers PRIMARY KEY (TierId),
    CONSTRAINT UQ_SubscriptionTiers_Name UNIQUE (TierName)
);

CREATE TABLE SubscriptionPlans (
    PlanId INT IDENTITY(1,1),
    TierId INT NOT NULL,
    DurationMonths INT NOT NULL, 
    Price DECIMAL(18,2) NOT NULL,
    IsActive BIT DEFAULT 1 NOT NULL,
    CONSTRAINT PK_SubscriptionPlans PRIMARY KEY (PlanId),
    CONSTRAINT FK_SubscriptionPlans_Tiers FOREIGN KEY (TierId) REFERENCES SubscriptionTiers(TierId)
);

CREATE TABLE UserSubscriptions (
    UserSubscriptionId UNIQUEIDENTIFIER DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PlanId INT NOT NULL,
    StartDate DATETIME NOT NULL DEFAULT GETDATE(),
    EndDate DATETIME NOT NULL,
    IsTrial BIT DEFAULT 0 NOT NULL,     
    IsActive BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_UserSubscriptions PRIMARY KEY (UserSubscriptionId),
    CONSTRAINT FK_UserSubscriptions_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserSubscriptions_Plans FOREIGN KEY (PlanId) REFERENCES SubscriptionPlans(PlanId)
);

-- ==========================================
-- 9. CHAT MODULE 
-- ==========================================
CREATE TABLE TeamMessages (
    MessageId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamId UNIQUEIDENTIFIER NOT NULL,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0 NOT NULL,
    CONSTRAINT PK_TeamMessages PRIMARY KEY (MessageId),
    CONSTRAINT FK_TeamMessages_Teams FOREIGN KEY (TeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamMessages_Users FOREIGN KEY (SenderId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
GO


-- ==========================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ==========================================
USE SmashClub;
GO

-- 1. THÊM DANH MỤC CƠ BẢN
INSERT INTO UserRoles (RoleId, RoleName) VALUES (1, N'Admin'), (2, N'User');
INSERT INTO TeamRoles (TeamRoleId, RoleName) VALUES (1, N'Leader'), (2, N'Member');
INSERT INTO CourtStatus (StatusId, StatusName) VALUES (1, N'Sẵn sàng'), (2, N'Bảo trì');

-- Đã sửa: Thêm seed data cho BookingStatus
INSERT INTO BookingStatus (StatusId, StatusName) VALUES (1, N'Pending'), (2, N'Confirmed'), (3, N'Cancelled');

INSERT INTO Sports (SportName, Description) VALUES 
    (N'Cầu Lông', N'Sân thảm tiêu chuẩn'), 
    (N'Bóng Bàn', N'Bàn thi đấu quốc tế');

INSERT INTO SportLevels (SportId, LevelName, RankValue) VALUES 
    (1, N'Cơ bản', 1), (1, N'Nâng cao', 2), (1, N'Tuyển thủ', 3),
    (2, N'Cơ bản', 1), (2, N'Nghiệp dư', 2), (2, N'Tuyển thủ', 3);

-- 2. THÊM CẤP ĐỘ VÀ GÓI SUBSCRIPTION
INSERT INTO SubscriptionTiers (TierName, Description) VALUES 
    ('No Paid', N'Gói miễn phí với tính năng cơ bản'),
    ('Pro', N'Gói nâng cao'),
    ('Ultra', N'Gói cao cấp nhất');

DECLARE @NoPaidId INT = (SELECT TierId FROM SubscriptionTiers WHERE TierName = 'No Paid');
DECLARE @ProId INT = (SELECT TierId FROM SubscriptionTiers WHERE TierName = 'Pro');
DECLARE @UltraId INT = (SELECT TierId FROM SubscriptionTiers WHERE TierName = 'Ultra');

INSERT INTO SubscriptionPlans (TierId, DurationMonths, Price) VALUES 
    (@NoPaidId, 0, 0),
    (@ProId, 1, 30000), (@ProId, 6, 180000), (@ProId, 12, 360000),
    (@UltraId, 1, 100000), (@UltraId, 6, 600000), (@UltraId, 12, 1200000);

-- 3. KHỞI TẠO BIẾN CHO DATA LIÊN KẾT
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
DECLARE @User1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @User2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @TeamId UNIQUEIDENTIFIER = NEWID();
DECLARE @FacilityId INT;
DECLARE @CourtId INT;
DECLARE @BookingId UNIQUEIDENTIFIER = NEWID();
DECLARE @ScheduleId UNIQUEIDENTIFIER = NEWID();

-- 4. THÊM NGƯỜI DÙNG & PROFILE
INSERT INTO Users (UserId, RoleId, FullName, Email, Password, PhoneNumber) VALUES 
    (@AdminId, 1, N'Quản Trị Viên', 'admin@smashclub.com', 'hashed_pwd', '0999999999'),
    (@User1Id, 2, N'Nguyễn Văn A', 'nguyenvana@gmail.com', 'hashed_pwd', '0912345678'),
    (@User2Id, 2, N'Trần Thị B', 'tranthib@gmail.com', 'hashed_pwd', '0987654321');

INSERT INTO UserSportProfiles (UserId, SportId, RankValue) VALUES 
    (@User1Id, 1, 1), (@User1Id, 2, 2),
    (@User2Id, 1, 2);

-- 5. KÍCH HOẠT DÙNG THỬ 3 THÁNG GÓI PRO CHO USER 1
DECLARE @TrialPlanId INT = (SELECT TOP 1 PlanId FROM SubscriptionPlans WHERE TierId = @ProId AND DurationMonths = 1);

-- Đã sửa: Đổi 'Status' thành 'IsActive' và truyền giá trị 1 (BIT)
INSERT INTO UserSubscriptions (UserId, PlanId, StartDate, EndDate, IsTrial, IsActive)
VALUES (
    @User1Id, @TrialPlanId, GETDATE(), DATEADD(month, 3, GETDATE()), 1, 1
);

-- 6. THÊM TEAM
INSERT INTO Teams (TeamId, TeamName, Description) VALUES 
    (@TeamId, N'Smashers Hanoi', N'CLB giao lưu cầu lông khu vực Cầu Giấy');

INSERT INTO TeamMembers (TeamId, UserId, TeamRoleId, Wins, Losses) VALUES 
    (@TeamId, @User1Id, 1, 10, 2), 
    (@TeamId, @User2Id, 2, 5, 5);

-- 7. TẠO CƠ SỞ VẬT CHẤT & SÂN BÃI (Do Admin làm chủ)
INSERT INTO Facilities (OwnerId, Name, City, District, [Address]) VALUES 
    (@AdminId, N'Sân Cầu Lông Bách Khoa', N'Hà Nội', N'Hai Bà Trưng', N'Khuôn viên ĐHBK');
SET @FacilityId = SCOPE_IDENTITY();

INSERT INTO Courts (FacilityId, SportId, CourtName, StatusId, IsActive) VALUES 
    (@FacilityId, 1, N'Sân Số 1 (Thảm VIP)', 1, 1);
SET @CourtId = SCOPE_IDENTITY();

-- 8. USER 1 ĐẶT SÂN
DECLARE @PlayStartTime DATETIME = DATEADD(day, 2, GETDATE());
DECLARE @PlayEndTime DATETIME = DATEADD(hour, 2, @PlayStartTime);

-- Đã sửa: Truyền thêm StatusId = 2 (Confirmed) vào lệnh Insert
INSERT INTO Bookings (BookingId, CourtId, BookedByUserId, StartTime, EndTime, TotalCost, StatusId) VALUES 
    (@BookingId, @CourtId, @User1Id, @PlayStartTime, @PlayEndTime, 300000, 2);

-- 9. TẠO LỊCH CHƠI CHO TEAM TỪ BOOKING
INSERT INTO Schedules (ScheduleId, HostTeamId, BookingId, Title, MaxParticipants, CostPerPerson, CostNote) VALUES 
    (@ScheduleId, @TeamId, @BookingId, N'Giao lưu cuối tuần', 10, 50000, N'Tiền sân 300k, tiền nước 200k chia đều');

-- 10. THÀNH VIÊN ĐĂNG KÝ THAM GIA
INSERT INTO ScheduleParticipants (ScheduleId, UserId, IsAttended) VALUES 
    (@ScheduleId, @User1Id, 1), 
    (@ScheduleId, @User2Id, 0);

-- 11. THÊM DỮ LIỆU TIN NHẮN MẪU (Module mới)
INSERT INTO TeamMessages (TeamId, SenderId, Content) VALUES 
    (@TeamId, @User1Id, N'Chào mọi người, cuối tuần này team mình giao lưu nhé!'),
    (@TeamId, @User2Id, N'Ok bạn, mình đã đăng ký tham gia rồi.');
GO
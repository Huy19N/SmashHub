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
    AvatarFileId UNIQUEIDENTIFIER,   
    CreatedAt DATETIME CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),
    LastPwdChange DATETIME NOT NULL DEFAULT GETDATE(),
    IsActive BIT CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CONSTRAINT PK_Users PRIMARY KEY (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_RoleId FOREIGN KEY (RoleId) REFERENCES UserRoles(RoleId)
);
 
-- BẢNG LƯU TRỮ FILE CỤC BỘ (DevOps khuyến cáo: Nên chuyển sang S3/MinIO ở Prod)
CREATE TABLE LocalFiles (
    FileId UNIQUEIDENTIFIER DEFAULT NEWID(),
    UploadedByUserId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileData VARBINARY(MAX) NOT NULL,
    FileType VARCHAR(20) NOT NULL,
    FileSizeBytes BIGINT,
    MimeType VARCHAR(100),
    Purpose VARCHAR(30) NOT NULL DEFAULT 'General',
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_LocalFiles PRIMARY KEY (FileId),
    CONSTRAINT FK_LocalFiles_Users FOREIGN KEY (UploadedByUserId) REFERENCES Users(UserId),
    CONSTRAINT CK_LocalFiles_Type CHECK (FileType IN ('Image', 'Video', 'Document')),
    CONSTRAINT CK_LocalFiles_Purpose CHECK (Purpose IN ('Avatar', 'ChatMedia', 'FacilityImage', 'General'))
);
 
ALTER TABLE Users
    ADD CONSTRAINT FK_Users_AvatarFile FOREIGN KEY (AvatarFileId) REFERENCES LocalFiles(FileId);
 
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
-- 4. FACILITY & COURT MODULE (ĐÃ CẬP NHẬT PHẦN 4)
-- ==========================================
CREATE TABLE Facilities(
    FacilityId INT IDENTITY(1,1),
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL,
    District NVARCHAR(50) NOT NULL,
    [Address] NVARCHAR(255) NOT NULL,
    [Location] GEOGRAPHY NOT NULL, -- Bắt buộc để tích hợp Map
    Latitude AS CAST([Location].Lat AS DECIMAL(18,9)),
    Longitude AS CAST([Location].Long AS DECIMAL(18,9)),
    PhoneNumber NVARCHAR(20),
    TermsAndRules NVARCHAR(MAX),   -- Điều khoản & Quy định của sân
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Facilities PRIMARY KEY (FacilityId),
    CONSTRAINT FK_Facilities_Users FOREIGN KEY (OwnerId) REFERENCES Users(UserId)
);

-- Thêm bảng Thời gian hoạt động chi tiết
CREATE TABLE FacilityOperatingHours (
    OperatingHourId INT IDENTITY(1,1),
    FacilityId INT NOT NULL,
    DayOfWeek INT NOT NULL, -- 2: Thứ 2, ..., 8: Chủ Nhật
    OpenTime TIME NOT NULL,
    CloseTime TIME NOT NULL,
    CONSTRAINT PK_FacilityOperatingHours PRIMARY KEY (OperatingHourId),
    CONSTRAINT FK_FacilityOperatingHours_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId) ON DELETE CASCADE,
    CONSTRAINT CK_FacilityOperatingHours_Day CHECK (DayOfWeek BETWEEN 2 AND 8),
    CONSTRAINT CK_FacilityOperatingHours_Time CHECK (OpenTime < CloseTime)
);

-- Thêm bảng Hình ảnh cơ sở
CREATE TABLE FacilityImages (
    FacilityImageId UNIQUEIDENTIFIER DEFAULT NEWID(),
    FacilityId INT NOT NULL,
    FileId UNIQUEIDENTIFIER NOT NULL,
    IsPrimary BIT DEFAULT 0,
    CONSTRAINT PK_FacilityImages PRIMARY KEY (FacilityImageId),
    CONSTRAINT FK_FacilityImages_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId) ON DELETE CASCADE,
    CONSTRAINT FK_FacilityImages_LocalFiles FOREIGN KEY (FileId) REFERENCES LocalFiles(FileId)
);

-- Thêm bảng Đánh giá (Reviews)
CREATE TABLE FacilityReviews (
    ReviewId UNIQUEIDENTIFIER DEFAULT NEWID(),
    FacilityId INT NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_FacilityReviews PRIMARY KEY (ReviewId),
    CONSTRAINT FK_FacilityReviews_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId) ON DELETE CASCADE,
    CONSTRAINT FK_FacilityReviews_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT CK_FacilityReviews_Rating CHECK (Rating BETWEEN 1 AND 5)
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
    DurationMinutes INT NOT NULL DEFAULT 60,
    Cost MONEY NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_CourtCosts PRIMARY KEY (CourtCostId, FacilityId),
    CONSTRAINT FK_CourtCosts_Courts FOREIGN KEY (CourtId) REFERENCES Courts(CourtId)
);
 
-- ==========================================
-- 5. BOOKING MODULE (ĐÃ CẬP NHẬT PHẦN 2)
-- ==========================================
CREATE TABLE BookingStatus (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_BookingStatus PRIMARY KEY (StatusId)
);
 
CREATE TABLE Bookings (
    BookingId UNIQUEIDENTIFIER DEFAULT NEWID(),
    CourtId INT NOT NULL,
    BookedByUserId UNIQUEIDENTIFIER NULL, -- NULL khi đặt trực tiếp Offline tại quầy
    BookingType VARCHAR(20) NOT NULL DEFAULT 'Online', -- 'Online' hoặc 'Offline'
    CustomerNameOffline NVARCHAR(100) NULL,           -- Tên khách vãng lai nếu đặt offline
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    TotalCost DECIMAL(18,2) DEFAULT 0,
    StatusId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Bookings PRIMARY KEY (BookingId),
    CONSTRAINT FK_Bookings_Courts FOREIGN KEY (CourtId) REFERENCES Courts(CourtId),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (BookedByUserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Bookings_BookingStatus FOREIGN KEY (StatusId) REFERENCES BookingStatus(StatusId),
    CONSTRAINT CK_Bookings_Type CHECK (BookingType IN ('Online', 'Offline')),
    CONSTRAINT CK_Bookings_Offline_Data CHECK (
        (BookingType = 'Online' AND BookedByUserId IS NOT NULL) OR 
        (BookingType = 'Offline')
    )
);
 
-- ==========================================
-- 6. SCHEDULING & MATCH CHALLENGE MODULE (ĐÃ CẬP NHẬT PHẦN 3 & 5)
-- ==========================================
CREATE TABLE Schedules (
    ScheduleId UNIQUEIDENTIFIER DEFAULT NEWID(),
    HostTeamId UNIQUEIDENTIFIER NOT NULL,
    BookingId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    MaxParticipants INT NOT NULL,
    BaseCourtCost DECIMAL(18,2) NOT NULL DEFAULT 0, -- Tiền gốc phần team phải trả
    ExtraFee DECIMAL(18,2) DEFAULT 0,                -- Tiền phát sinh phụ thu cuối buổi
    ExtraFeeNote NVARCHAR(500),                     -- Ghi chú tiền phát sinh (Cầu, bóng, nước...)
    TotalCalculatedCost DECIMAL(18,2) DEFAULT 0,    -- Tổng tiền sau phụ thu = BaseCourtCost + ExtraFee
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
 
CREATE TABLE MatchChallengeStatuses (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_MatchChallengeStatuses PRIMARY KEY (StatusId)
);
 
CREATE TABLE MatchChallenges (
    ChallengeId UNIQUEIDENTIFIER DEFAULT NEWID(),
    ScheduleId UNIQUEIDENTIFIER NOT NULL,
    HostTeamId UNIQUEIDENTIFIER NOT NULL,
    SportId INT NOT NULL,
    StatusId INT NOT NULL DEFAULT 1,
    TotalCost DECIMAL(18,2) NOT NULL,  -- Tổng tiền gốc của slot lịch đặt
    IsCostSplit BIT NOT NULL DEFAULT 1, -- 1: Chia đôi tiền sân cho nhóm đối thủ join công bằng
    Message NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_MatchChallenges PRIMARY KEY (ChallengeId),
    CONSTRAINT FK_MatchChallenges_Schedules FOREIGN KEY (ScheduleId) REFERENCES Schedules(ScheduleId),
    CONSTRAINT FK_MatchChallenges_HostTeam FOREIGN KEY (HostTeamId) REFERENCES Teams(TeamId),
    CONSTRAINT FK_MatchChallenges_Sports FOREIGN KEY (SportId) REFERENCES Sports(SportId),
    CONSTRAINT FK_MatchChallenges_Statuses FOREIGN KEY (StatusId) REFERENCES MatchChallengeStatuses(StatusId)
);
 
CREATE TABLE MatchAcceptanceStatuses (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_MatchAcceptanceStatuses PRIMARY KEY (StatusId)
);
 
CREATE TABLE MatchAcceptances (
    AcceptanceId UNIQUEIDENTIFIER DEFAULT NEWID(),
    ChallengeId UNIQUEIDENTIFIER NOT NULL,
    ChallengerTeamId UNIQUEIDENTIFIER NOT NULL,
    StatusId INT NOT NULL DEFAULT 1,
    DecidedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_MatchAcceptances PRIMARY KEY (AcceptanceId),
    CONSTRAINT FK_MatchAcceptances_Challenges FOREIGN KEY (ChallengeId) REFERENCES MatchChallenges(ChallengeId),
    CONSTRAINT FK_MatchAcceptances_Teams FOREIGN KEY (ChallengerTeamId) REFERENCES Teams(TeamId),
    CONSTRAINT FK_MatchAcceptances_Statuses FOREIGN KEY (StatusId) REFERENCES MatchAcceptanceStatuses(StatusId),
    CONSTRAINT UQ_MatchAcceptances_ChallengeTeam UNIQUE (ChallengeId, ChallengerTeamId)
);
 
-- ==========================================
-- 7. EMAIL MODULE
-- ==========================================
CREATE TABLE EmailConfirms(
    Code VARCHAR(5) NOT NULL,
    Email VARCHAR(255) NOT NULL,
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
 
CREATE TABLE Features (
    FeatureId INT IDENTITY(1,1),
    FeatureCode VARCHAR(50) NOT NULL,
    FeatureName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    CONSTRAINT PK_Features PRIMARY KEY (FeatureId),
    CONSTRAINT UQ_Features_Code UNIQUE (FeatureCode)
);
 
CREATE TABLE TierFeatures (
    TierId INT NOT NULL,
    FeatureId INT NOT NULL,
    CONSTRAINT PK_TierFeatures PRIMARY KEY (TierId, FeatureId),
    CONSTRAINT FK_TierFeatures_Tiers FOREIGN KEY (TierId) REFERENCES SubscriptionTiers(TierId) ON DELETE CASCADE,
    CONSTRAINT FK_TierFeatures_Features FOREIGN KEY (FeatureId) REFERENCES Features(FeatureId) ON DELETE CASCADE
);
 
-- ==========================================
-- 9. CHAT MODULE 
-- ==========================================
CREATE TABLE TeamMessages (
    MessageId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamId UNIQUEIDENTIFIER NOT NULL,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    MessageType INT NOT NULL DEFAULT 0, -- Đổi từ chữ 'Text' sang dạng INT mặc định theo đúng CHECK ràng buộc bên dưới
    Content NVARCHAR(MAX),
    MediaFileId UNIQUEIDENTIFIER,
    SentAt DATETIME DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0 NOT NULL,
    CONSTRAINT PK_TeamMessages PRIMARY KEY (MessageId),
    CONSTRAINT FK_TeamMessages_Teams FOREIGN KEY (TeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamMessages_Users FOREIGN KEY (SenderId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_TeamMessages_Media FOREIGN KEY (MediaFileId) REFERENCES LocalFiles(FileId),
    CONSTRAINT CK_TeamMessages_Type CHECK (MessageType >=0 AND MessageType <=2),
    CONSTRAINT CK_TeamMessages_Content CHECK ( 
        (MessageType = 0 AND Content IS NOT NULL) OR
        (MessageType >=1 AND MessageType <=2 AND MediaFileId IS NOT NULL)
    )
);
 
CREATE TABLE VideoCallSessions (
    SessionId UNIQUEIDENTIFIER DEFAULT NEWID(),
    TeamId UNIQUEIDENTIFIER NOT NULL,
    InitiatedByUserId UNIQUEIDENTIFIER NOT NULL,
    StartedAt DATETIME DEFAULT GETDATE(),
    EndedAt DATETIME,
    CONSTRAINT PK_VideoCallSessions PRIMARY KEY (SessionId),
    CONSTRAINT FK_VideoCallSessions_Teams FOREIGN KEY (TeamId) REFERENCES Teams(TeamId) ON DELETE CASCADE,
    CONSTRAINT FK_VideoCallSessions_Users FOREIGN KEY (InitiatedByUserId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
 
CREATE TABLE VideoCallParticipants (
    SessionId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    JoinedAt DATETIME DEFAULT GETDATE(),
    LeftAt DATETIME,
    CONSTRAINT PK_VideoCallParticipants PRIMARY KEY (SessionId, UserId),
    CONSTRAINT FK_VideoCallParticipants_Sessions FOREIGN KEY (SessionId) REFERENCES VideoCallSessions(SessionId) ON DELETE CASCADE,
    CONSTRAINT FK_VideoCallParticipants_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
 
-- ==========================================
-- 10. PAYMENT CONFIGURATION & WALLET MODULE (ĐÃ CẬP NHẬT PHẦN 1)
-- ==========================================
CREATE TABLE PaymentGateways (
    GatewayId INT IDENTITY(1,1),
    GatewayCode VARCHAR(50) NOT NULL, 
    GatewayName NVARCHAR(100) NOT NULL,
    IsActive BIT DEFAULT 1 NOT NULL,
    CONSTRAINT PK_PaymentGateways PRIMARY KEY (GatewayId),
    CONSTRAINT UQ_PaymentGateways_Code UNIQUE (GatewayCode)
);
 
CREATE TABLE FacilityPaymentConfigs (
    ConfigId UNIQUEIDENTIFIER DEFAULT NEWID(),
    FacilityId INT NOT NULL,
    PaymentModel INT NOT NULL,      -- 1: Thu hộ (Escrow), 2: VietQR/SePay, 3: BYOG
    GatewayId INT,                  
    ApiKey NVARCHAR(MAX),      
    ApiSecret NVARCHAR(MAX),       
    WebhookUrl NVARCHAR(MAX),
    IsActive BIT DEFAULT 1 NOT NULL,
    IsDefault BIT DEFAULT 0,        -- Đánh dấu phương thức ưu tiên (Fallback mechanism)
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    CONSTRAINT PK_FacilityPaymentConfigs PRIMARY KEY (ConfigId),
    CONSTRAINT FK_FacilityPaymentConfigs_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId),
    CONSTRAINT FK_FacilityPaymentConfigs_Gateways FOREIGN KEY (GatewayId) REFERENCES PaymentGateways(GatewayId)
);
 
CREATE TABLE FacilityWallets (
    FacilityId INT NOT NULL,
    Balance DECIMAL(18,2) DEFAULT 0 NOT NULL,
    TotalEarned DECIMAL(18,2) DEFAULT 0 NOT NULL,
    LastUpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_FacilityWallets PRIMARY KEY (FacilityId),
    CONSTRAINT FK_FacilityWallets_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId)
);
 
CREATE TABLE FacilityBankAccounts (
    BankAccountId INT IDENTITY(1,1),
    FacilityId INT NOT NULL,
    BankName NVARCHAR(100) NOT NULL,   -- Ví dụ: 'Vietcombank', 'MBBank'
    AccountNumber NVARCHAR(50) NOT NULL,
    AccountHolder NVARCHAR(255) NOT NULL,
    IsPrimary BIT DEFAULT 0,           -- Thêm cờ Primary tài khoản nhận tiền chính, các tài khoản khác làm Backup
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    CONSTRAINT PK_FacilityBankAccounts PRIMARY KEY (BankAccountId),
    CONSTRAINT FK_FacilityBankAccounts_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId)
);
 
CREATE TABLE PayoutRequests (
    PayoutId UNIQUEIDENTIFIER DEFAULT NEWID(),
    FacilityId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    BankAccountId INT NOT NULL,   
    StatusId INT NOT NULL DEFAULT 1,   
    TransactionRef NVARCHAR(100),   
    RequestedAt DATETIME DEFAULT GETDATE(),
    ProcessedAt DATETIME,
    Note NVARCHAR(500),
    CONSTRAINT PK_PayoutRequests PRIMARY KEY (PayoutId),
    CONSTRAINT FK_PayoutRequests_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId),
    CONSTRAINT FK_PayoutRequests_BankAccounts FOREIGN KEY (BankAccountId) REFERENCES FacilityBankAccounts(BankAccountId),
    CONSTRAINT CK_PayoutRequests_Amount CHECK (Amount > 0)
);
 
-- ==========================================
-- 11. PAYMENT TRANSACTIONS MODULE
-- ==========================================
CREATE TABLE PayoutStatuses ( 
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_PayoutStatuses PRIMARY KEY (StatusId)
);

CREATE TABLE Payouts (
    PayoutId UNIQUEIDENTIFIER DEFAULT NEWID(),
    PaymentId UNIQUEIDENTIFIER NOT NULL,
    FacilityId INT NOT NULL,
    OwnerUserId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    StatusId INT NOT NULL DEFAULT 1,
    BankAccountNo NVARCHAR(50),
    BankName NVARCHAR(100),
    AccountHolder NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    Note NVARCHAR(500),
    CONSTRAINT PK_Payouts PRIMARY KEY (PayoutId),
    CONSTRAINT FK_Payouts_Payments FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId),
    CONSTRAINT FK_Payouts_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId),
    CONSTRAINT FK_Payouts_Users FOREIGN KEY (OwnerUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Payouts_PayoutStatuses FOREIGN KEY (StatusId) REFERENCES PayoutStatuses(StatusId)
);

CREATE TABLE PaymentStatuses ( 
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_PaymentStatuses PRIMARY KEY (StatusId)
);
 
CREATE TABLE Payments (
    PaymentId UNIQUEIDENTIFIER DEFAULT NEWID(),
    OrderCode BIGINT NOT NULL,                    
    PaymentType NVARCHAR(20) NOT NULL,         -- 'Booking', 'Subscription'
    ReferenceId NVARCHAR(100) NOT NULL,         
    UserId UNIQUEIDENTIFIER NOT NULL,            
    Amount DECIMAL(18,2) NOT NULL,               
    [Description] NVARCHAR(255),                  
    StatusId INT NOT NULL DEFAULT 1,              
    PaymentMethod NVARCHAR(50) NOT NULL DEFAULT N'Gateway', 
    GatewayId INT NULL,        
    GatewayTransactionId NVARCHAR(255) NULL,  
    FacilityConfigId UNIQUEIDENTIFIER NULL,  
    Note NVARCHAR(500),                       
    CreatedAt DATETIME DEFAULT GETDATE(),
    PaidAt DATETIME,
    ConfirmedByUserId UNIQUEIDENTIFIER,              
    CONSTRAINT PK_Payments PRIMARY KEY (PaymentId),
    CONSTRAINT UQ_Payments_OrderCode UNIQUE (OrderCode),
    CONSTRAINT FK_Payments_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Payments_PaymentStatuses FOREIGN KEY (StatusId) REFERENCES PaymentStatuses(StatusId),
    CONSTRAINT FK_Payments_ConfirmedBy FOREIGN KEY (ConfirmedByUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Payments_Gateways FOREIGN KEY (GatewayId) REFERENCES PaymentGateways(GatewayId),
    CONSTRAINT FK_Payments_FacilityConfigs FOREIGN KEY (FacilityConfigId) REFERENCES FacilityPaymentConfigs(ConfigId),
    CONSTRAINT CK_Payments_Method CHECK (PaymentMethod IN ('Cash', 'BankTransfer', 'Internal', 'Gateway')),
    CONSTRAINT CK_Payments_Type CHECK (PaymentType IN ('Booking', 'Subscription'))
);
GO

-- ==========================================
-- TỐI ƯU HÓA HIỆU NĂNG: INDEXES (DBA ĐỀ XUẤT)
-- ==========================================
CREATE NONCLUSTERED INDEX IX_Bookings_Court_Time 
ON Bookings (CourtId, StartTime, EndTime) 
INCLUDE (StatusId);

CREATE NONCLUSTERED INDEX IX_Payments_OrderCode 
ON Payments (OrderCode);
GO

-- ==========================================
-- SEED DATA CẬP NHẬT CHUẨN
-- ==========================================
INSERT INTO UserRoles (RoleId, RoleName) VALUES (1, N'Admin'), (2, N'User'), (3, N'FacilityOwner');
INSERT INTO TeamRoles (TeamRoleId, RoleName) VALUES (1, N'Leader'), (2, N'Member');
INSERT INTO CourtStatus (StatusId, StatusName) VALUES (1, N'Sẵn sàng'), (2, N'Bảo trì');
INSERT INTO BookingStatus (StatusId, StatusName) VALUES (1, N'Pending'), (2, N'Confirmed'), (3, N'Cancelled');
INSERT INTO PaymentStatuses (StatusId, StatusName) VALUES (1, N'Pending'), (2, N'Paid'), (3, N'Cancelled'), (4, N'Expired'), (5, N'Refunded');
INSERT INTO PayoutStatuses (StatusId, StatusName) VALUES (1, N'Pending'), (2, N'Completed'), (3, N'Failed');
INSERT INTO MatchChallengeStatuses (StatusId, StatusName) VALUES (1, N'Open'), (2, N'Matched'), (3, N'Cancelled'), (4, N'Completed');
INSERT INTO MatchAcceptanceStatuses (StatusId, StatusName) VALUES (1, N'Pending'), (2, N'Accepted'), (3, N'Rejected');
 
INSERT INTO Sports (SportName, Description) VALUES (N'Cầu Lông', N'Sân thảm tiêu chuẩn'), (N'Bóng Bàn', N'Bàn ITTF'), (N'Pickleball', N'Sân ngoài trời');
INSERT INTO SportLevels (SportId, LevelName, RankValue) VALUES (1, N'Cơ bản', 1), (1, N'Nâng cao', 2), (1, N'Tuyển thủ', 3);
 
INSERT INTO SubscriptionTiers (TierName, Description) VALUES ('Free', N'Cơ bản'), ('Basic', N'Nâng cao'), ('Pro', N'Toàn bộ');
DECLARE @FreeId INT = (SELECT TierId FROM SubscriptionTiers WHERE TierName = 'Free');
DECLARE @ProId INT = (SELECT TierId FROM SubscriptionTiers WHERE TierName = 'Pro');
INSERT INTO SubscriptionPlans (TierId, DurationMonths, Price) VALUES (@FreeId, 0, 0), (@ProId, 1, 99000);
 
INSERT INTO PaymentGateways (GatewayCode, GatewayName) VALUES ('VNPAY', N'Cổng thanh toán VNPay'), ('MOMO', N'Ví điện tử MoMo'), ('PAYOS', N'VietQR Open Banking (PayOS)'), ('STRIPE', N'Thẻ quốc tế Stripe');
 
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
DECLARE @Owner1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @User1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Facility1Id INT;
DECLARE @GatewayVNPayId INT = (SELECT GatewayId FROM PaymentGateways WHERE GatewayCode = 'VNPAY');
 
INSERT INTO Users (UserId, RoleId, FullName, Email, Password) VALUES  
    (@AdminId, 1, N'Admin', 'admin@smash.vn', 'hash'),
    (@Owner1Id, 3, N'Trần Chủ Sân', 'owner@smash.vn', 'hash'),
    (@User1Id, 2, N'Hải Nguyễn', 'hai@smash.vn', 'hash');
 
INSERT INTO Facilities (OwnerId, Name, City, District, [Address], [Location], PhoneNumber, TermsAndRules)
VALUES (@Owner1Id, N'SmashClub Q10', N'HCM', N'Q10', N'Thành Thái, Q10', geography::STGeomFromText('POINT(106.6644 10.7726)', 4326), '0901234567', N'Vui lòng đi giày đế kếp không để lại dấu.');
SET @Facility1Id = SCOPE_IDENTITY();
 
INSERT INTO FacilityWallets (FacilityId, Balance, TotalEarned) VALUES (@Facility1Id, 0, 0);
INSERT INTO FacilityBankAccounts (FacilityId, BankName, AccountNumber, AccountHolder, IsPrimary) VALUES (@Facility1Id, N'MBBank', N'1234567890', N'TRAN CHU SAN', 1);
INSERT INTO FacilityBankAccounts (FacilityId, BankName, AccountNumber, AccountHolder, IsPrimary) VALUES (@Facility1Id, N'Vietcombank', N'0987654321', N'TRAN CHU SAN', 0);
 
DECLARE @Config1Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO FacilityPaymentConfigs (ConfigId, FacilityId, PaymentModel, GatewayId, ApiKey, ApiSecret, IsDefault)
VALUES (@Config1Id, @Facility1Id, 3, @GatewayVNPayId, 'encrypted_vnp_tmncode', 'encrypted_vnp_hashsecret', 1);
 
INSERT INTO Courts (FacilityId, SportId, CourtName, StatusId) VALUES (@Facility1Id, 1, N'Sân VIP 1', 1);
DECLARE @Court1Id INT = SCOPE_IDENTITY();
 
DECLARE @Booking1Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO Bookings (BookingId, CourtId, BookedByUserId, BookingType, StartTime, EndTime, TotalCost, StatusId) 
VALUES (@Booking1Id, @Court1Id, @User1Id, 'Online', GETDATE(), DATEADD(hour, 2, GETDATE()), 300000, 2);
 
INSERT INTO Payments (PaymentId, OrderCode, PaymentType, ReferenceId, UserId, Amount, StatusId, PaymentMethod, GatewayId, GatewayTransactionId, FacilityConfigId, PaidAt)
VALUES (NEWID(), 200001, 'Booking', CONVERT(NVARCHAR(100), @Booking1Id), @User1Id, 300000, 2, 'Gateway', @GatewayVNPayId, 'VNPAY_123456789', @Config1Id, GETDATE());
GO
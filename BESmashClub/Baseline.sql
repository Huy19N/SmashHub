IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [BookingStatus] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_BookingStatus] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [CourtStatus] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NULL,
    CONSTRAINT [PK_CourtStatus] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [EmailConfirms] (
    [Code] varchar(5) NOT NULL,
    [Email] varchar(255) NOT NULL,
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    [ExpiredAt] datetime NOT NULL,
    CONSTRAINT [PK_EmailConfirms] PRIMARY KEY ([Code], [Email])
);
GO

CREATE TABLE [FacilityStatuses] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_FacilityStatuses] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [Features] (
    [FeatureId] int NOT NULL IDENTITY,
    [FeatureCode] varchar(50) NOT NULL,
    [FeatureName] nvarchar(100) NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Features] PRIMARY KEY ([FeatureId])
);
GO

CREATE TABLE [MatchAcceptanceStatuses] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_MatchAcceptanceStatuses] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [MatchChallengeStatuses] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_MatchChallengeStatuses] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [PaymentGateways] (
    [GatewayId] int NOT NULL IDENTITY,
    [GatewayCode] varchar(50) NOT NULL,
    [GatewayName] nvarchar(100) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_PaymentGateways] PRIMARY KEY ([GatewayId])
);
GO

CREATE TABLE [PaymentStatuses] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_PaymentStatuses] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [PayoutStatuses] (
    [StatusId] int NOT NULL,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_PayoutStatuses] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [Sports] (
    [SportId] int NOT NULL IDENTITY,
    [SportName] nvarchar(100) NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Sports] PRIMARY KEY ([SportId])
);
GO

CREATE TABLE [SubscriptionTiers] (
    [TierId] int NOT NULL IDENTITY,
    [TierName] nvarchar(50) NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_SubscriptionTiers] PRIMARY KEY ([TierId])
);
GO

CREATE TABLE [SystemSettings] (
    [SettingKey] nvarchar(100) NOT NULL,
    [SettingValue] nvarchar(max) NOT NULL,
    [Description] nvarchar(255) NULL,
    [UpdatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([SettingKey])
);
GO

CREATE TABLE [TeamRoles] (
    [TeamRoleId] int NOT NULL,
    [RoleName] nvarchar(50) NOT NULL,
    [IsDelete] bit NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_TeamRoles] PRIMARY KEY ([TeamRoleId])
);
GO

CREATE TABLE [UserRoles] (
    [RoleId] int NOT NULL,
    [RoleName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([RoleId])
);
GO

CREATE TABLE [SportLevels] (
    [SportId] int NOT NULL,
    [RankValue] int NOT NULL,
    [LevelName] nvarchar(50) NOT NULL,
    [Description] nvarchar(500) NULL,
    [IsDelete] bit NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_SportLevels] PRIMARY KEY ([SportId], [RankValue]),
    CONSTRAINT [FK_SportLevels_Sports] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]) ON DELETE CASCADE
);
GO

CREATE TABLE [SubscriptionPlans] (
    [PlanId] int NOT NULL IDENTITY,
    [TierId] int NOT NULL,
    [DurationMonths] int NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY ([PlanId]),
    CONSTRAINT [FK_SubscriptionPlans_Tiers] FOREIGN KEY ([TierId]) REFERENCES [SubscriptionTiers] ([TierId])
);
GO

CREATE TABLE [TierFeatures] (
    [TierId] int NOT NULL,
    [FeatureId] int NOT NULL,
    CONSTRAINT [PK_TierFeatures] PRIMARY KEY ([TierId], [FeatureId]),
    CONSTRAINT [FK_TierFeatures_Features] FOREIGN KEY ([FeatureId]) REFERENCES [Features] ([FeatureId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TierFeatures_Tiers] FOREIGN KEY ([TierId]) REFERENCES [SubscriptionTiers] ([TierId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Bookings] (
    [BookingId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [CourtId] int NOT NULL,
    [BookedByUserId] uniqueidentifier NULL,
    [IsBookingOffline] bit NOT NULL,
    [CustomerNameOffline] nvarchar(100) NULL,
    [StartTime] datetime NOT NULL,
    [EndTime] datetime NOT NULL,
    [TotalCost] decimal(18,2) NULL DEFAULT 0.0,
    [PlatformFee] decimal(18,2) NULL DEFAULT 0.0,
    [StatusId] int NOT NULL,
    [CancellationReason] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([BookingId]),
    CONSTRAINT [FK_Bookings_BookingStatus] FOREIGN KEY ([StatusId]) REFERENCES [BookingStatus] ([StatusId])
);
GO

CREATE TABLE [CourtCosts] (
    [CourtCostId] int NOT NULL IDENTITY,
    [FacilityId] int NOT NULL,
    [CourtId] int NOT NULL,
    [DayOfWeek] int NOT NULL,
    [StartTime] time NOT NULL,
    [EndTime] time NOT NULL,
    [DurationMinutes] int NOT NULL DEFAULT 60,
    [Cost] money NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_CourtCosts] PRIMARY KEY ([CourtCostId], [FacilityId])
);
GO

CREATE TABLE [Courts] (
    [CourtId] int NOT NULL IDENTITY,
    [FacilityId] int NOT NULL,
    [SportId] int NOT NULL,
    [CourtName] nvarchar(50) NOT NULL,
    [StatusId] int NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_Courts] PRIMARY KEY ([CourtId]),
    CONSTRAINT [FK_Courts_CourtStatus] FOREIGN KEY ([StatusId]) REFERENCES [CourtStatus] ([StatusId]),
    CONSTRAINT [FK_Courts_Sports] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId])
);
GO

CREATE TABLE [Facilities] (
    [FacilityId] int NOT NULL IDENTITY,
    [OwnerId] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [City] nvarchar(50) NOT NULL,
    [District] nvarchar(50) NOT NULL,
    [Address] nvarchar(255) NOT NULL,
    [Latitude] decimal(18,9) NULL,
    [Longitude] decimal(18,9) NULL,
    [PhoneNumber] nvarchar(20) NULL,
    [BusinessCode] nvarchar(100) NULL,
    [TermsAndRules] nvarchar(max) NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    [IsDelete] bit NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_Facilities] PRIMARY KEY ([FacilityId]),
    CONSTRAINT [FK_Facilities_Statuses] FOREIGN KEY ([StatusId]) REFERENCES [FacilityStatuses] ([StatusId])
);
GO

CREATE TABLE [FacilityBankAccounts] (
    [BankAccountId] int NOT NULL IDENTITY,
    [FacilityId] int NOT NULL,
    [BankName] nvarchar(100) NOT NULL,
    [AccountNumber] nvarchar(50) NOT NULL,
    [AccountHolder] nvarchar(255) NOT NULL,
    [IsPrimary] bit NULL DEFAULT CAST(0 AS bit),
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [UpdatedAt] datetime NULL,
    CONSTRAINT [PK_FacilityBankAccounts] PRIMARY KEY ([BankAccountId]),
    CONSTRAINT [FK_FacilityBankAccounts_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId])
);
GO

CREATE TABLE [FacilityOperatingHours] (
    [OperatingHourId] int NOT NULL IDENTITY,
    [FacilityId] int NOT NULL,
    [DayOfWeek] int NOT NULL,
    [OpenTime] time NOT NULL,
    [CloseTime] time NOT NULL,
    CONSTRAINT [PK_FacilityOperatingHours] PRIMARY KEY ([OperatingHourId]),
    CONSTRAINT [FK_FacilityOperatingHours_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]) ON DELETE CASCADE
);
GO

CREATE TABLE [FacilityPaymentConfigs] (
    [ConfigId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [FacilityId] int NOT NULL,
    [PaymentModel] int NOT NULL,
    [GatewayId] int NULL,
    [ApiKey] nvarchar(max) NULL,
    [ApiSecret] nvarchar(max) NULL,
    [WebhookUrl] nvarchar(max) NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [IsDefault] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [UpdatedAt] datetime NULL,
    CONSTRAINT [PK_FacilityPaymentConfigs] PRIMARY KEY ([ConfigId]),
    CONSTRAINT [FK_FacilityPaymentConfigs_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]),
    CONSTRAINT [FK_FacilityPaymentConfigs_Gateways] FOREIGN KEY ([GatewayId]) REFERENCES [PaymentGateways] ([GatewayId])
);
GO

CREATE TABLE [FacilityWallets] (
    [FacilityId] int NOT NULL,
    [Balance] decimal(18,2) NOT NULL,
    [TotalEarned] decimal(18,2) NOT NULL,
    [LastUpdatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_FacilityWallets] PRIMARY KEY ([FacilityId]),
    CONSTRAINT [FK_FacilityWallets_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId])
);
GO

CREATE TABLE [PayoutRequests] (
    [PayoutId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [FacilityId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BankAccountId] int NOT NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [TransactionRef] nvarchar(100) NULL,
    [RequestedAt] datetime NULL DEFAULT ((getdate())),
    [ProcessedAt] datetime NULL,
    [Note] nvarchar(500) NULL,
    CONSTRAINT [PK_PayoutRequests] PRIMARY KEY ([PayoutId]),
    CONSTRAINT [FK_PayoutRequests_BankAccounts] FOREIGN KEY ([BankAccountId]) REFERENCES [FacilityBankAccounts] ([BankAccountId]),
    CONSTRAINT [FK_PayoutRequests_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId])
);
GO

CREATE TABLE [FacilityImages] (
    [FacilityImageId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [FacilityId] int NOT NULL,
    [FileId] uniqueidentifier NOT NULL,
    [IsPrimary] bit NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK_FacilityImages] PRIMARY KEY ([FacilityImageId]),
    CONSTRAINT [FK_FacilityImages_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]) ON DELETE CASCADE
);
GO

CREATE TABLE [FacilityReviews] (
    [ReviewId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [FacilityId] int NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Rating] int NOT NULL,
    [Comment] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_FacilityReviews] PRIMARY KEY ([ReviewId]),
    CONSTRAINT [FK_FacilityReviews_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]) ON DELETE CASCADE
);
GO

CREATE TABLE [MatchAcceptances] (
    [AcceptanceId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [ChallengeId] uniqueidentifier NOT NULL,
    [ChallengerTeamId] uniqueidentifier NOT NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [DecidedAt] datetime NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_MatchAcceptances] PRIMARY KEY ([AcceptanceId]),
    CONSTRAINT [FK_MatchAcceptances_Statuses] FOREIGN KEY ([StatusId]) REFERENCES [MatchAcceptanceStatuses] ([StatusId])
);
GO

CREATE TABLE [MatchChallenges] (
    [ChallengeId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [ScheduleId] uniqueidentifier NOT NULL,
    [HostTeamId] uniqueidentifier NOT NULL,
    [SportId] int NOT NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [TotalCost] decimal(18,2) NOT NULL,
    [IsCostSplit] bit NOT NULL DEFAULT CAST(1 AS bit),
    [Message] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_MatchChallenges] PRIMARY KEY ([ChallengeId]),
    CONSTRAINT [FK_MatchChallenges_Sports] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK_MatchChallenges_Statuses] FOREIGN KEY ([StatusId]) REFERENCES [MatchChallengeStatuses] ([StatusId])
);
GO

CREATE TABLE [Notifications] (
    [NotificationId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [UserId] uniqueidentifier NOT NULL,
    [Title] nvarchar(255) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [NotificationType] nvarchar(50) NOT NULL,
    [RelatedEntityId] uniqueidentifier NULL,
    [IsRead] bit NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationId])
);
GO

CREATE TABLE [Payments] (
    [PaymentId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [OrderCode] bigint NOT NULL,
    [PaymentType] nvarchar(20) NOT NULL,
    [ReferenceId] nvarchar(500) NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PlatformFee] decimal(18,2) NOT NULL,
    [RefundAmount] decimal(18,2) NOT NULL,
    [Description] nvarchar(255) NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [PaymentMethod] nvarchar(50) NOT NULL DEFAULT N'Gateway',
    [GatewayId] int NULL,
    [GatewayTransactionId] nvarchar(255) NULL,
    [FacilityConfigId] uniqueidentifier NULL,
    [Note] nvarchar(500) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [PaidAt] datetime NULL,
    [ConfirmedByUserId] uniqueidentifier NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
    CONSTRAINT [FK_Payments_FacilityConfigs] FOREIGN KEY ([FacilityConfigId]) REFERENCES [FacilityPaymentConfigs] ([ConfigId]),
    CONSTRAINT [FK_Payments_Gateways] FOREIGN KEY ([GatewayId]) REFERENCES [PaymentGateways] ([GatewayId]),
    CONSTRAINT [FK_Payments_PaymentStatuses] FOREIGN KEY ([StatusId]) REFERENCES [PaymentStatuses] ([StatusId])
);
GO

CREATE TABLE [Payouts] (
    [PayoutId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [PaymentId] uniqueidentifier NOT NULL,
    [FacilityId] int NOT NULL,
    [OwnerUserId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [StatusId] int NOT NULL DEFAULT 1,
    [BankAccountNo] nvarchar(50) NULL,
    [BankName] nvarchar(100) NULL,
    [AccountHolder] nvarchar(255) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [CompletedAt] datetime NULL,
    [Note] nvarchar(500) NULL,
    CONSTRAINT [PK_Payouts] PRIMARY KEY ([PayoutId]),
    CONSTRAINT [FK_Payouts_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]),
    CONSTRAINT [FK_Payouts_Payments] FOREIGN KEY ([PaymentId]) REFERENCES [Payments] ([PaymentId]),
    CONSTRAINT [FK_Payouts_PayoutStatuses] FOREIGN KEY ([StatusId]) REFERENCES [PayoutStatuses] ([StatusId])
);
GO

CREATE TABLE [PostComments] (
    [CommentId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [PostId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [IsDeleted] bit NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_PostComments] PRIMARY KEY ([CommentId])
);
GO

CREATE TABLE [PostLikes] (
    [PostId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_PostLikes] PRIMARY KEY ([PostId], [UserId])
);
GO

CREATE TABLE [PostMedias] (
    [PostId] uniqueidentifier NOT NULL,
    [FileId] uniqueidentifier NOT NULL,
    [DisplayOrder] int NOT NULL,
    CONSTRAINT [PK_PostMedias] PRIMARY KEY ([PostId], [FileId])
);
GO

CREATE TABLE [PostReports] (
    [ReportId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [PostId] uniqueidentifier NOT NULL,
    [ReporterId] uniqueidentifier NOT NULL,
    [Reason] nvarchar(500) NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_PostReports] PRIMARY KEY ([ReportId])
);
GO

CREATE TABLE [Posts] (
    [PostId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [AuthorUserId] uniqueidentifier NOT NULL,
    [FacilityId] int NULL,
    [TeamId] uniqueidentifier NULL,
    [PostType] int NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [MediaFileId] uniqueidentifier NULL,
    [IsBoosted] bit NOT NULL,
    [Status] int NOT NULL,
    [IsDeleted] bit NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [UpdatedAt] datetime NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([PostId]),
    CONSTRAINT [FK_Posts_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId])
);
GO

CREATE TABLE [RefreshTokens] (
    [RefreshTokenId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [UserId] uniqueidentifier NOT NULL,
    [Token] varchar(255) NOT NULL,
    [JwtId] varchar(255) NOT NULL,
    [CreatedAt] datetime NOT NULL,
    [ExpiredAt] datetime NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [IPAddress] nvarchar(255) NULL,
    [UserAgent] nvarchar(max) NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([RefreshTokenId])
);
GO

CREATE TABLE [ScheduleParticipants] (
    [ScheduleId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [IsAttended] bit NOT NULL,
    [CostToPay] decimal(18,2) NOT NULL,
    [IsPaid] bit NOT NULL,
    [JoinedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_ScheduleParticipants] PRIMARY KEY ([ScheduleId], [UserId])
);
GO

CREATE TABLE [Schedules] (
    [ScheduleId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [HostTeamId] uniqueidentifier NOT NULL,
    [BookingId] uniqueidentifier NOT NULL,
    [Title] nvarchar(255) NOT NULL,
    [MaxParticipants] int NOT NULL,
    [BaseCourtCost] decimal(18,2) NOT NULL,
    [ExtraFee] decimal(18,2) NULL DEFAULT 0.0,
    [ExtraFeeNote] nvarchar(500) NULL,
    [TotalCalculatedCost] decimal(18,2) NULL DEFAULT 0.0,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_Schedules] PRIMARY KEY ([ScheduleId]),
    CONSTRAINT [FK_Schedules_Bookings] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId])
);
GO

CREATE TABLE [StoredFiles] (
    [FileId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [UploadedByUserId] uniqueidentifier NOT NULL,
    [BucketName] varchar(100) NOT NULL,
    [ObjectName] varchar(255) NOT NULL,
    [OriginalFileName] nvarchar(255) NOT NULL,
    [FileType] tinyint NOT NULL,
    [FileSizeBytes] bigint NULL,
    [MimeType] varchar(100) NULL,
    [Purpose] tinyint NOT NULL DEFAULT CAST(4 AS tinyint),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_StoredFiles] PRIMARY KEY ([FileId])
);
GO

CREATE TABLE [Teams] (
    [TeamId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [TeamName] nvarchar(255) NOT NULL,
    [AvatarFileId] uniqueidentifier NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_Teams] PRIMARY KEY ([TeamId]),
    CONSTRAINT [FK_Teams_AvatarFile] FOREIGN KEY ([AvatarFileId]) REFERENCES [StoredFiles] ([FileId])
);
GO

CREATE TABLE [Users] (
    [UserId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [RoleId] int NOT NULL,
    [FullName] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [Password] varchar(255) NOT NULL,
    [PhoneNumber] nvarchar(20) NULL,
    [AvatarFileId] uniqueidentifier NULL,
    [Cccd] nvarchar(25) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [LastPwdChange] datetime NOT NULL DEFAULT ((getdate())),
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    [BanUntil] datetime2 NULL,
    [BanReason] nvarchar(max) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_AvatarFile] FOREIGN KEY ([AvatarFileId]) REFERENCES [StoredFiles] ([FileId]),
    CONSTRAINT [FK_Users_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [UserRoles] ([RoleId])
);
GO

CREATE TABLE [TeamInvites] (
    [InviteId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [TeamId] uniqueidentifier NOT NULL,
    [CreatedByUserId] uniqueidentifier NOT NULL,
    [InviteToken] varchar(100) NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [ExpiredAt] datetime NOT NULL,
    [MaxUses] int NULL DEFAULT 1,
    [CurrentUses] int NULL DEFAULT 0,
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_TeamInvites] PRIMARY KEY ([InviteId]),
    CONSTRAINT [FK_TeamInvites_Teams] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TeamInvites_Users] FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [TeamMembers] (
    [TeamId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [TeamRoleId] int NOT NULL,
    [Wins] int NOT NULL,
    [Losses] int NOT NULL,
    [JoinedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_TeamMembers] PRIMARY KEY ([TeamId], [UserId]),
    CONSTRAINT [FK_TeamMembers_TeamRoles] FOREIGN KEY ([TeamRoleId]) REFERENCES [TeamRoles] ([TeamRoleId]),
    CONSTRAINT [FK_TeamMembers_Teams] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TeamMembers_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [TeamMessages] (
    [MessageId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [TeamId] uniqueidentifier NOT NULL,
    [SenderId] uniqueidentifier NOT NULL,
    [MessageType] int NOT NULL,
    [Content] nvarchar(max) NULL,
    [MediaFileId] uniqueidentifier NULL,
    [SentAt] datetime NULL DEFAULT ((getdate())),
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_TeamMessages] PRIMARY KEY ([MessageId]),
    CONSTRAINT [FK_TeamMessages_Media] FOREIGN KEY ([MediaFileId]) REFERENCES [StoredFiles] ([FileId]),
    CONSTRAINT [FK_TeamMessages_Teams] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TeamMessages_Users] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [UserBlocks] (
    [BlockerId] uniqueidentifier NOT NULL,
    [BlockedId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_UserBlocks] PRIMARY KEY ([BlockerId], [BlockedId]),
    CONSTRAINT [FK_UserBlocks_Blocked] FOREIGN KEY ([BlockedId]) REFERENCES [Users] ([UserId]),
    CONSTRAINT [FK_UserBlocks_Blocker] FOREIGN KEY ([BlockerId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserSportProfiles] (
    [UserId] uniqueidentifier NOT NULL,
    [SportId] int NOT NULL,
    [RankValue] int NOT NULL,
    [UpdatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_UserSportProfiles] PRIMARY KEY ([UserId], [SportId]),
    CONSTRAINT [FK_UserSportProfiles_SportLevels] FOREIGN KEY ([SportId], [RankValue]) REFERENCES [SportLevels] ([SportId], [RankValue]),
    CONSTRAINT [FK_UserSportProfiles_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserSubscriptions] (
    [UserSubscriptionId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [UserId] uniqueidentifier NOT NULL,
    [PlanId] int NOT NULL,
    [StartDate] datetime NOT NULL DEFAULT ((getdate())),
    [EndDate] datetime NOT NULL,
    [IsTrial] bit NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_UserSubscriptions] PRIMARY KEY ([UserSubscriptionId]),
    CONSTRAINT [FK_UserSubscriptions_Plans] FOREIGN KEY ([PlanId]) REFERENCES [SubscriptionPlans] ([PlanId]),
    CONSTRAINT [FK_UserSubscriptions_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);
GO

CREATE TABLE [VideoCallSessions] (
    [SessionId] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [TeamId] uniqueidentifier NOT NULL,
    [InitiatedByUserId] uniqueidentifier NOT NULL,
    [StartedAt] datetime NULL DEFAULT ((getdate())),
    [EndedAt] datetime NULL,
    CONSTRAINT [PK_VideoCallSessions] PRIMARY KEY ([SessionId]),
    CONSTRAINT [FK_VideoCallSessions_Teams] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamId]) ON DELETE CASCADE,
    CONSTRAINT [FK_VideoCallSessions_Users] FOREIGN KEY ([InitiatedByUserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [VideoCallParticipants] (
    [SessionId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [JoinedAt] datetime NULL DEFAULT ((getdate())),
    [LeftAt] datetime NULL,
    CONSTRAINT [PK_VideoCallParticipants] PRIMARY KEY ([SessionId], [UserId]),
    CONSTRAINT [FK_VideoCallParticipants_Sessions] FOREIGN KEY ([SessionId]) REFERENCES [VideoCallSessions] ([SessionId]) ON DELETE CASCADE,
    CONSTRAINT [FK_VideoCallParticipants_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE INDEX [IX_Bookings_BookedByUserId] ON [Bookings] ([BookedByUserId]);
GO

CREATE INDEX [IX_Bookings_Court_Time] ON [Bookings] ([CourtId], [StartTime], [EndTime]);
GO

CREATE INDEX [IX_Bookings_StatusId] ON [Bookings] ([StatusId]);
GO

CREATE INDEX [IX_CourtCosts_CourtId] ON [CourtCosts] ([CourtId]);
GO

CREATE INDEX [IX_Courts_FacilityId] ON [Courts] ([FacilityId]);
GO

CREATE INDEX [IX_Courts_SportId] ON [Courts] ([SportId]);
GO

CREATE INDEX [IX_Courts_StatusId] ON [Courts] ([StatusId]);
GO

CREATE INDEX [IX_Facilities_OwnerId] ON [Facilities] ([OwnerId]);
GO

CREATE INDEX [IX_Facilities_StatusId] ON [Facilities] ([StatusId]);
GO

CREATE INDEX [IX_FacilityBankAccounts_FacilityId] ON [FacilityBankAccounts] ([FacilityId]);
GO

CREATE INDEX [IX_FacilityImages_FacilityId] ON [FacilityImages] ([FacilityId]);
GO

CREATE INDEX [IX_FacilityImages_FileId] ON [FacilityImages] ([FileId]);
GO

CREATE INDEX [IX_FacilityOperatingHours_FacilityId] ON [FacilityOperatingHours] ([FacilityId]);
GO

CREATE INDEX [IX_FacilityPaymentConfigs_FacilityId] ON [FacilityPaymentConfigs] ([FacilityId]);
GO

CREATE INDEX [IX_FacilityPaymentConfigs_GatewayId] ON [FacilityPaymentConfigs] ([GatewayId]);
GO

CREATE INDEX [IX_FacilityReviews_FacilityId] ON [FacilityReviews] ([FacilityId]);
GO

CREATE INDEX [IX_FacilityReviews_UserId] ON [FacilityReviews] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_Features_Code] ON [Features] ([FeatureCode]);
GO

CREATE INDEX [IX_MatchAcceptances_ChallengerTeamId] ON [MatchAcceptances] ([ChallengerTeamId]);
GO

CREATE INDEX [IX_MatchAcceptances_StatusId] ON [MatchAcceptances] ([StatusId]);
GO

CREATE UNIQUE INDEX [UQ_MatchAcceptances_ChallengeTeam] ON [MatchAcceptances] ([ChallengeId], [ChallengerTeamId]);
GO

CREATE INDEX [IX_MatchChallenges_HostTeamId] ON [MatchChallenges] ([HostTeamId]);
GO

CREATE INDEX [IX_MatchChallenges_ScheduleId] ON [MatchChallenges] ([ScheduleId]);
GO

CREATE INDEX [IX_MatchChallenges_SportId] ON [MatchChallenges] ([SportId]);
GO

CREATE INDEX [IX_MatchChallenges_StatusId] ON [MatchChallenges] ([StatusId]);
GO

CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_PaymentGateways_Code] ON [PaymentGateways] ([GatewayCode]);
GO

CREATE INDEX [IX_Payments_ConfirmedByUserId] ON [Payments] ([ConfirmedByUserId]);
GO

CREATE INDEX [IX_Payments_FacilityConfigId] ON [Payments] ([FacilityConfigId]);
GO

CREATE INDEX [IX_Payments_GatewayId] ON [Payments] ([GatewayId]);
GO

CREATE INDEX [IX_Payments_OrderCode] ON [Payments] ([OrderCode]);
GO

CREATE INDEX [IX_Payments_StatusId] ON [Payments] ([StatusId]);
GO

CREATE INDEX [IX_Payments_UserId] ON [Payments] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_Payments_OrderCode] ON [Payments] ([OrderCode]);
GO

CREATE INDEX [IX_PayoutRequests_BankAccountId] ON [PayoutRequests] ([BankAccountId]);
GO

CREATE INDEX [IX_PayoutRequests_FacilityId] ON [PayoutRequests] ([FacilityId]);
GO

CREATE INDEX [IX_Payouts_FacilityId] ON [Payouts] ([FacilityId]);
GO

CREATE INDEX [IX_Payouts_OwnerUserId] ON [Payouts] ([OwnerUserId]);
GO

CREATE INDEX [IX_Payouts_PaymentId] ON [Payouts] ([PaymentId]);
GO

CREATE INDEX [IX_Payouts_StatusId] ON [Payouts] ([StatusId]);
GO

CREATE INDEX [IX_PostComments_PostId] ON [PostComments] ([PostId]);
GO

CREATE INDEX [IX_PostComments_UserId] ON [PostComments] ([UserId]);
GO

CREATE INDEX [IX_PostLikes_UserId] ON [PostLikes] ([UserId]);
GO

CREATE INDEX [IX_PostMedias_FileId] ON [PostMedias] ([FileId]);
GO

CREATE INDEX [IX_PostReports_PostId] ON [PostReports] ([PostId]);
GO

CREATE INDEX [IX_PostReports_ReporterId] ON [PostReports] ([ReporterId]);
GO

CREATE INDEX [IX_Posts_AuthorUserId] ON [Posts] ([AuthorUserId]);
GO

CREATE INDEX [IX_Posts_FacilityId] ON [Posts] ([FacilityId]);
GO

CREATE INDEX [IX_Posts_MediaFileId] ON [Posts] ([MediaFileId]);
GO

CREATE INDEX [IX_Posts_TeamId] ON [Posts] ([TeamId]);
GO

CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
GO

CREATE INDEX [IX_ScheduleParticipants_UserId] ON [ScheduleParticipants] ([UserId]);
GO

CREATE INDEX [IX_Schedules_BookingId] ON [Schedules] ([BookingId]);
GO

CREATE INDEX [IX_Schedules_HostTeamId] ON [Schedules] ([HostTeamId]);
GO

CREATE UNIQUE INDEX [UQ_Sports_SportName] ON [Sports] ([SportName]);
GO

CREATE INDEX [IX_StoredFiles_UploadedByUserId] ON [StoredFiles] ([UploadedByUserId]);
GO

CREATE INDEX [IX_SubscriptionPlans_TierId] ON [SubscriptionPlans] ([TierId]);
GO

CREATE UNIQUE INDEX [UQ_SubscriptionTiers_Name] ON [SubscriptionTiers] ([TierName]);
GO

CREATE INDEX [IX_TeamInvites_CreatedByUserId] ON [TeamInvites] ([CreatedByUserId]);
GO

CREATE INDEX [IX_TeamInvites_TeamId] ON [TeamInvites] ([TeamId]);
GO

CREATE UNIQUE INDEX [UQ__TeamInvi__AB479560D8E317AC] ON [TeamInvites] ([InviteToken]);
GO

CREATE INDEX [IX_TeamMembers_TeamRoleId] ON [TeamMembers] ([TeamRoleId]);
GO

CREATE INDEX [IX_TeamMembers_UserId] ON [TeamMembers] ([UserId]);
GO

CREATE INDEX [IX_TeamMessages_MediaFileId] ON [TeamMessages] ([MediaFileId]);
GO

CREATE INDEX [IX_TeamMessages_SenderId] ON [TeamMessages] ([SenderId]);
GO

CREATE INDEX [IX_TeamMessages_TeamId] ON [TeamMessages] ([TeamId]);
GO

CREATE INDEX [IX_Teams_AvatarFileId] ON [Teams] ([AvatarFileId]);
GO

CREATE INDEX [IX_TierFeatures_FeatureId] ON [TierFeatures] ([FeatureId]);
GO

CREATE INDEX [IX_UserBlocks_BlockedId] ON [UserBlocks] ([BlockedId]);
GO

CREATE INDEX [IX_Users_AvatarFileId] ON [Users] ([AvatarFileId]);
GO

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
GO

CREATE UNIQUE INDEX [UQ_Users_Email] ON [Users] ([Email]);
GO

CREATE INDEX [IX_UserSportProfiles_SportId_RankValue] ON [UserSportProfiles] ([SportId], [RankValue]);
GO

CREATE INDEX [IX_UserSubscriptions_PlanId] ON [UserSubscriptions] ([PlanId]);
GO

CREATE INDEX [IX_UserSubscriptions_UserId] ON [UserSubscriptions] ([UserId]);
GO

CREATE INDEX [IX_VideoCallParticipants_UserId] ON [VideoCallParticipants] ([UserId]);
GO

CREATE INDEX [IX_VideoCallSessions_InitiatedByUserId] ON [VideoCallSessions] ([InitiatedByUserId]);
GO

CREATE INDEX [IX_VideoCallSessions_TeamId] ON [VideoCallSessions] ([TeamId]);
GO

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Courts] FOREIGN KEY ([CourtId]) REFERENCES [Courts] ([CourtId]);
GO

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Users] FOREIGN KEY ([BookedByUserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [CourtCosts] ADD CONSTRAINT [FK_CourtCosts_Courts] FOREIGN KEY ([CourtId]) REFERENCES [Courts] ([CourtId]);
GO

ALTER TABLE [Courts] ADD CONSTRAINT [FK_Courts_Facilities] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([FacilityId]);
GO

ALTER TABLE [Facilities] ADD CONSTRAINT [FK_Facilities_Users] FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [FacilityImages] ADD CONSTRAINT [FK_FacilityImages_StoredFiles] FOREIGN KEY ([FileId]) REFERENCES [StoredFiles] ([FileId]);
GO

ALTER TABLE [FacilityReviews] ADD CONSTRAINT [FK_FacilityReviews_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [MatchAcceptances] ADD CONSTRAINT [FK_MatchAcceptances_Challenges] FOREIGN KEY ([ChallengeId]) REFERENCES [MatchChallenges] ([ChallengeId]);
GO

ALTER TABLE [MatchAcceptances] ADD CONSTRAINT [FK_MatchAcceptances_Teams] FOREIGN KEY ([ChallengerTeamId]) REFERENCES [Teams] ([TeamId]);
GO

ALTER TABLE [MatchChallenges] ADD CONSTRAINT [FK_MatchChallenges_HostTeam] FOREIGN KEY ([HostTeamId]) REFERENCES [Teams] ([TeamId]);
GO

ALTER TABLE [MatchChallenges] ADD CONSTRAINT [FK_MatchChallenges_Schedules] FOREIGN KEY ([ScheduleId]) REFERENCES [Schedules] ([ScheduleId]);
GO

ALTER TABLE [Notifications] ADD CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
GO

ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_ConfirmedBy] FOREIGN KEY ([ConfirmedByUserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [Payouts] ADD CONSTRAINT [FK_Payouts_Users] FOREIGN KEY ([OwnerUserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [PostComments] ADD CONSTRAINT [FK_PostComments_Posts] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE CASCADE;
GO

ALTER TABLE [PostComments] ADD CONSTRAINT [FK_PostComments_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [PostLikes] ADD CONSTRAINT [FK_PostLikes_Posts] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE CASCADE;
GO

ALTER TABLE [PostLikes] ADD CONSTRAINT [FK_PostLikes_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [PostMedias] ADD CONSTRAINT [FK_PostMedias_Posts] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE CASCADE;
GO

ALTER TABLE [PostMedias] ADD CONSTRAINT [FK_PostMedias_StoredFiles] FOREIGN KEY ([FileId]) REFERENCES [StoredFiles] ([FileId]) ON DELETE CASCADE;
GO

ALTER TABLE [PostReports] ADD CONSTRAINT [FK_PostReports_Posts] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE CASCADE;
GO

ALTER TABLE [PostReports] ADD CONSTRAINT [FK_PostReports_Users] FOREIGN KEY ([ReporterId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [Posts] ADD CONSTRAINT [FK_Posts_Media] FOREIGN KEY ([MediaFileId]) REFERENCES [StoredFiles] ([FileId]);
GO

ALTER TABLE [Posts] ADD CONSTRAINT [FK_Posts_Teams] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamId]);
GO

ALTER TABLE [Posts] ADD CONSTRAINT [FK_Posts_Users] FOREIGN KEY ([AuthorUserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
GO

ALTER TABLE [RefreshTokens] ADD CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
GO

ALTER TABLE [ScheduleParticipants] ADD CONSTRAINT [FK_ScheduleParticipants_Schedules] FOREIGN KEY ([ScheduleId]) REFERENCES [Schedules] ([ScheduleId]) ON DELETE CASCADE;
GO

ALTER TABLE [ScheduleParticipants] ADD CONSTRAINT [FK_ScheduleParticipants_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

ALTER TABLE [Schedules] ADD CONSTRAINT [FK_Schedules_HostTeam] FOREIGN KEY ([HostTeamId]) REFERENCES [Teams] ([TeamId]) ON DELETE CASCADE;
GO

ALTER TABLE [StoredFiles] ADD CONSTRAINT [FK_StoredFiles_Users] FOREIGN KEY ([UploadedByUserId]) REFERENCES [Users] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260701074203_Baseline', N'8.0.24');
GO

COMMIT;
GO


USE SmashClub;
GO

-- ==========================================
-- 10. PAYMENT MODULE (Provider-agnostic)
-- ==========================================

-- Bảng trạng thái thanh toán
CREATE TABLE PaymentStatuses (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_PaymentStatuses PRIMARY KEY (StatusId)
);

-- Seed data cho PaymentStatuses
INSERT INTO PaymentStatuses (StatusId, StatusName) VALUES
    (1, N'Pending'),
    (2, N'Paid'),
    (3, N'Cancelled'),
    (4, N'Expired'),
    (5, N'Refunded');
GO

-- Bảng giao dịch thanh toán (generic cho nhiều provider)
CREATE TABLE Payments (
    PaymentId UNIQUEIDENTIFIER DEFAULT NEWID(),
    OrderCode BIGINT NOT NULL,                        -- Mã đơn hàng (unique per provider)
    PaymentType NVARCHAR(20) NOT NULL,                -- 'Subscription' hoặc 'Booking'
    ReferenceId NVARCHAR(100) NOT NULL,               -- ID tham chiếu (BookingId / UserSubscriptionId)
    UserId UNIQUEIDENTIFIER NOT NULL,                 -- Người thanh toán
    Amount DECIMAL(18,2) NOT NULL,                    -- Số tiền
    [Description] NVARCHAR(255),                      -- Mô tả giao dịch
    StatusId INT NOT NULL DEFAULT 1,                  -- FK → PaymentStatuses
    PaymentProvider NVARCHAR(50) NOT NULL DEFAULT 'PayOS',  -- 'PayOS', 'VNPay', 'Momo', etc.
    CheckoutUrl NVARCHAR(500),                        -- URL thanh toán
    TransactionId NVARCHAR(100),                      -- Transaction ID từ provider
    CreatedAt DATETIME DEFAULT GETDATE(),
    PaidAt DATETIME,
    CONSTRAINT PK_Payments PRIMARY KEY (PaymentId),
    CONSTRAINT UQ_Payments_OrderCode UNIQUE (OrderCode),
    CONSTRAINT FK_Payments_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Payments_PaymentStatuses FOREIGN KEY (StatusId) REFERENCES PaymentStatuses(StatusId)
);
GO

-- ==========================================
-- 11. PAYOUT MODULE (Lệnh chi cho chủ sân)
-- ==========================================

-- Bảng trạng thái lệnh chi
CREATE TABLE PayoutStatuses (
    StatusId INT NOT NULL,
    StatusName NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_PayoutStatuses PRIMARY KEY (StatusId)
);

INSERT INTO PayoutStatuses (StatusId, StatusName) VALUES
    (1, N'Pending'),
    (2, N'Processing'),
    (3, N'Completed'),
    (4, N'Failed');
GO

-- Bảng lệnh chi (chuyển tiền từ platform sang chủ sân)
CREATE TABLE Payouts (
    PayoutId UNIQUEIDENTIFIER DEFAULT NEWID(),
    PaymentId UNIQUEIDENTIFIER NOT NULL,              -- Giao dịch gốc
    FacilityId INT NOT NULL,                          -- Sân bãi
    OwnerUserId UNIQUEIDENTIFIER NOT NULL,            -- Chủ sân
    Amount DECIMAL(18,2) NOT NULL,                    -- Số tiền cần chuyển
    StatusId INT NOT NULL DEFAULT 1,                  -- FK → PayoutStatuses
    BankAccountNo NVARCHAR(50),                       -- Snapshot số tài khoản tại thời điểm tạo
    BankName NVARCHAR(100),                           -- Snapshot tên ngân hàng
    AccountHolder NVARCHAR(255),                      -- Snapshot tên chủ tài khoản
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    Note NVARCHAR(500),
    CONSTRAINT PK_Payouts PRIMARY KEY (PayoutId),
    CONSTRAINT FK_Payouts_Payments FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId),
    CONSTRAINT FK_Payouts_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId),
    CONSTRAINT FK_Payouts_Users FOREIGN KEY (OwnerUserId) REFERENCES Users(UserId)
);
GO

-- ==========================================
-- 12. FACILITY BANK ACCOUNTS
-- ==========================================

-- Thông tin ngân hàng của chủ sân (để nhận lệnh chi)
CREATE TABLE FacilityBankAccounts (
    FacilityId INT NOT NULL,
    BankName NVARCHAR(100) NOT NULL,
    AccountNumber NVARCHAR(50) NOT NULL,
    AccountHolder NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    CONSTRAINT PK_FacilityBankAccounts PRIMARY KEY (FacilityId),
    CONSTRAINT FK_FacilityBankAccounts_Facilities FOREIGN KEY (FacilityId) REFERENCES Facilities(FacilityId)
);
GO

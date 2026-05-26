-- ==========================================================================================
-- HỆ THỐNG QUẢN LÝ ĐẶT SÂN THỂ THAO TOÀN QUỐC (SportBooking)
-- Kiến trúc: Monolithic | Cơ sở dữ liệu: SQL Server (T-SQL)
-- Thiết kế bởi: PM Core System
-- ==========================================================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'SportBooking')
BEGIN
    ALTER DATABASE SportBooking SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SportBooking;
END
GO

CREATE DATABASE SportBooking;
GO

USE SportBooking;
GO

-- ==========================================================================================
-- 1. TẠO BẢNG (TABLES DEFINITIONS)
-- ==========================================================================================

-- Bảng Người dùng (Hỗ trợ phân quyền Player, Owner, Admin & Ví điện tử In-App)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Phone VARCHAR(15) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Player', 'Owner', 'Admin')),
    WalletBalance DECIMAL(18,2) DEFAULT 0.00 CHECK (WalletBalance >= 0),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Loại hình thể thao (Cầu lông, Bóng đá, Pickleball, Tennis, Bóng chuyền...)
CREATE TABLE SportTypes (
    SportID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) UNIQUE NOT NULL
);

-- Bảng Cụm sân / Khu phức hợp thể thao (Phân tách theo Tỉnh/Thành phố toàn quốc)
CREATE TABLE Venues (
    VenueID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL,
    District NVARCHAR(50) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Sân đơn lẻ (Chi tiết từng sân bên trong Cụm sân)
CREATE TABLE Courts (
    CourtID INT IDENTITY(1,1) PRIMARY KEY,
    VenueID INT NOT NULL FOREIGN KEY REFERENCES Venues(VenueID),
    SportID INT NOT NULL FOREIGN KEY REFERENCES SportTypes(SportID),
    CourtName NVARCHAR(50) NOT NULL,
    PricePerHour DECIMAL(18,2) NOT NULL CHECK (PricePerHour > 0),
    Status VARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'Maintenance', 'Inactive'))
);

-- Bảng Đặt lịch (Bookings) - Quản lý trạng thái và khung giờ trùng chấp
CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    PlayerID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    CourtID INT NOT NULL FOREIGN KEY REFERENCES Courts(CourtID),
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL CHECK (TotalPrice >= 0),
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_BookingTime CHECK (EndTime > StartTime)
);

-- Bảng Giao dịch (Transactions) - Lưu vết dòng tiền In-App (Nạp, Thanh toán, Rút tiền)
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    BookingID INT NULL FOREIGN KEY REFERENCES Bookings(BookingID),
    Amount DECIMAL(18,2) NOT NULL CHECK (Amount <> 0),
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Deposit', 'Payment', 'Withdraw', 'Refund')),
    Status VARCHAR(20) DEFAULT 'Processing' CHECK (Status IN ('Processing', 'Success', 'Failed')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Đội nhóm / Team vãng lai ổn định
CREATE TABLE Teams (
    TeamID INT IDENTITY(1,1) PRIMARY KEY,
    CaptainID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    SportID INT NOT NULL FOREIGN KEY REFERENCES SportTypes(SportID),
    TeamName NVARCHAR(100) NOT NULL,
    Level NVARCHAR(20) CHECK (Level IN (N'Gà mờ', N'Trung bình', N'Khá', N'Bán chuyên', N'Chuyên nghiệp')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Bài đăng tìm đối / Tuyển thành viên vãng lai cho Kèo hoặc Sân
CREATE TABLE MatchPosts (
    PostID INT IDENTITY(1,1) PRIMARY KEY,
    AuthorID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    VenueID INT NOT NULL FOREIGN KEY REFERENCES Venues(VenueID),
    SportID INT NOT NULL FOREIGN KEY REFERENCES SportTypes(SportID),
    PlayTime DATETIME NOT NULL,
    RequiredPlayers INT NOT NULL CHECK (RequiredPlayers > 0),
    JoinedPlayers INT DEFAULT 0 CHECK (JoinedPlayers >= 0),
    Description NVARCHAR(500),
    Status VARCHAR(20) DEFAULT 'Open' CHECK (Status IN ('Open', 'Full', 'Cancelled', 'Closed')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Yêu cầu tham gia kèo (Match Requests)
CREATE TABLE MatchRequests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    PostID INT NOT NULL FOREIGN KEY REFERENCES MatchPosts(PostID),
    PlayerID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Accepted', 'Rejected', 'Cancelled')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- ==========================================================================================
-- 2. TỐI ƯU HÓA HIỆU NĂNG (INDEXES)
-- ==========================================================================================

-- Index hỗ trợ tìm kiếm và kiểm tra trùng lịch (Concurrency Optimization)
CREATE NONCLUSTERED INDEX IX_Bookings_Court_Time 
ON Bookings(CourtID, StartTime, EndTime) 
INCLUDE (Status);

-- Index hỗ trợ tra cứu sân theo khu vực địa lý toàn quốc (Filter Optimization)
CREATE NONCLUSTERED INDEX IX_Venues_Location 
ON Venues(City, District) 
WHERE IsActive = 1;
GO

-- ==========================================================================================
-- 3. HÀM VÀ THỦ TỤC XỬ LÝ LOGIC (FUNCTIONS & STORED PROCEDURES)
-- ==========================================================================================

-- 3.1. Chức năng: Đặt lịch nâng cao (Xử lý đồng thời cao - Tránh Double Booking & Thanh toán trừ tiền)
CREATE PROCEDURE sp_BookCourt
    @PlayerID INT,
    @CourtID INT,
    @StartTime DATETIME,
    @EndTime DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Áp dụng Isolation Level cao nhất để tránh hiện tượng Phantom Read/Dirty Read khi check slot đặt sân lẻ
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Tính toán thời gian và giá tiền
        DECLARE @PricePerHour DECIMAL(18,2);
        DECLARE @DurationHours FLOAT;
        DECLARE @TotalPrice DECIMAL(18,2);
        DECLARE @OwnerID INT;

        SELECT @PricePerHour = PricePerHour, @OwnerID = v.OwnerID 
        FROM Courts c
        JOIN Venues v ON c.VenueID = v.VenueID
        WHERE c.CourtID = @CourtID AND c.Status = 'Available';

        IF @PricePerHour IS NULL
        BEGIN
            THROW 50001, N'Sân thể thao không tồn tại hoặc đang bảo trì.', 1;
        END

        SET @DurationHours = DATEDIFF(MINUTE, @StartTime, @EndTime) / 60.0;
        SET @TotalPrice = @PricePerHour * @DurationHours;

        -- 2. Kiểm tra trùng lịch (Trái tim của bài toán Concurrency)
        IF EXISTS (
            SELECT 1 FROM Bookings WITH (XLOCK) -- Khóa độc quyền dòng kiểm tra
            WHERE CourtID = @CourtID 
              AND Status IN ('Pending', 'Confirmed')
              AND ((StartTime < @EndTime AND EndTime > @StartTime))
        )
        BEGIN
            THROW 50002, N'Khung giờ này đã có người đặt trước. Vui lòng chọn khung giờ khác.', 1;
        END

        -- 3. Kiểm tra số dư tài khoản của Player
        DECLARE @PlayerBalance DECIMAL(18,2);
        SELECT @PlayerBalance = WalletBalance FROM Users WHERE UserID = @PlayerID;

        IF @PlayerBalance < @TotalPrice
        BEGIN
            THROW 50003, N'Số dư tài khoản không đủ để thực hiện thanh toán In-App.', 1;
        END

        -- 4. Thực hiện trừ tiền người chơi và cộng tiền tạm tính cho chủ sân
        UPDATE Users SET WalletBalance = WalletBalance - @TotalPrice WHERE UserID = @PlayerID;
        UPDATE Users SET WalletBalance = WalletBalance + @TotalPrice WHERE UserID = @OwnerID;

        -- 5. Ghi nhận Booking
        INSERT INTO Bookings (PlayerID, CourtID, StartTime, EndTime, TotalPrice, Status)
        VALUES (@PlayerID, @CourtID, @StartTime, @EndTime, @TotalPrice, 'Confirmed');

        DECLARE @NewBookingID INT = SCOPE_IDENTITY();

        -- 6. Ghi nhận Log Transaction dịch chuyển dòng tiền
        INSERT INTO Transactions (UserID, BookingID, Amount, TransactionType, Status)
        VALUES (@PlayerID, @NewBookingID, -@TotalPrice, 'Payment', 'Success');

        INSERT INTO Transactions (UserID, BookingID, Amount, TransactionType, Status)
        VALUES (@OwnerID, @NewBookingID, @TotalPrice, 'Payment', 'Success');

        COMMIT TRANSACTION;
        SELECT @NewBookingID AS BookingID, @TotalPrice AS TotalPrice, 'Success' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 3.2. Chức năng: Dashboard Tổng quan cho Chủ Sân (Thống kê Doanh thu, Tỷ lệ lấp đầy)
CREATE PROCEDURE sp_GetOwnerDashboard
    @OwnerID INT,
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- Thống kê tổng số tiền thu nhập và số lượt đặt sân
    SELECT 
        COUNT(b.BookingID) AS TotalBookings,
        ISNULL(SUM(b.TotalPrice), 0) AS TotalRevenue,
        COUNT(DISTINCT c.CourtID) AS ActiveCourts
    FROM Bookings b
    JOIN Courts c ON b.CourtID = c.CourtID
    JOIN Venues v ON c.VenueID = v.VenueID
    WHERE v.OwnerID = @OwnerID 
      AND b.Status = 'Confirmed'
      AND b.StartTime BETWEEN @StartDate AND @EndDate;

    -- Thống kê chi tiết doanh thu theo từng bộ môn (Cầu lông, Bóng đá...) để chủ sân cân đối đầu tư
    SELECT 
        st.Name AS SportName,
        COUNT(b.BookingID) AS BookingCount,
        SUM(b.TotalPrice) AS RevenueBySport
    FROM Bookings b
    JOIN Courts c ON b.CourtID = c.CourtID
    JOIN SportTypes st ON c.SportID = st.SportID
    JOIN Venues v ON c.VenueID = v.VenueID
    WHERE v.OwnerID = @OwnerID 
      AND b.Status = 'Confirmed'
      AND b.StartTime BETWEEN @StartDate AND @EndDate
    GROUP BY st.Name;
END;
GO

-- 3.3. Chức năng: Tạo và đăng bài tuyển thành viên vãng lai lắp đầy lịch trống
CREATE PROCEDURE sp_CreateMatchPost
    @AuthorID INT,
    @VenueID INT,
    @SportID INT,
    @PlayTime DATETIME,
    @RequiredPlayers INT,
    @Description NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO MatchPosts (AuthorID, VenueID, SportID, PlayTime, RequiredPlayers, JoinedPlayers, Description, Status)
        VALUES (@AuthorID, @VenueID, @SportID, @PlayTime, @RequiredPlayers, 0, @Description, 'Open');
        
        SELECT SCOPE_IDENTITY() AS PostID, 'Success' AS Message;
    END TRY
    BEGIN CATCH
        RAISERROR(N'Lỗi khi đăng bài tuyển vãng lai.', 16, 1);
    END CATCH
END;
GO

-- 3.4. Chức năng: Quản lý đăng ký tham gia kèo vãng lai (Match Joining Management)
CREATE PROCEDURE sp_ManageMatchRequest
    @RequestID INT,
    @Action VARCHAR(20) -- 'Accept' hoặc 'Reject'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @PostID INT;
        DECLARE @CurrentStatus VARCHAR(20);

        SELECT @PostID = PostID, @CurrentStatus = Status FROM MatchRequests WHERE RequestID = @RequestID;

        IF @Action = 'Accept'
        BEGIN
            -- Cập nhật trạng thái request
            UPDATE MatchRequests SET Status = 'Accepted' WHERE RequestID = @RequestID;
            
            -- Tăng số lượng user đã join vào bài viết gốc
            UPDATE MatchPosts 
            SET JoinedPlayers = JoinedPlayers + 1 
            WHERE PostID = @PostID;

            -- Tự động đóng kèo nếu đã đủ người
            UPDATE MatchPosts 
            SET Status = 'Full' 
            WHERE PostID = @PostID AND JoinedPlayers >= RequiredPlayers;
        END
        ELSE IF @Action = 'Reject'
        BEGIN
            UPDATE MatchRequests SET Status = 'Rejected' WHERE RequestID = @RequestID;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        RAISERROR(N'Lỗi khi xử lý yêu cầu tham gia kèo.', 16, 1);
    END CATCH
END;
GO

-- ==========================================================================================
-- 4. KHỞI TẠO DỮ LIỆU MẪU (SEED DATA)
-- ==========================================================================================

-- Thêm bộ môn thể thao phổ biến toàn quốc theo yêu cầu bài toán
INSERT INTO SportTypes (Name) VALUES 
(N'Cầu lông'), (N'Bóng đá'), (N'Pickleball'), (N'Bóng chuyền'), (N'Tennis');

-- Tạo tài khoản mẫu (1 Chủ sân, 1 Khách hàng)
INSERT INTO Users (Phone, PasswordHash, FullName, Role, WalletBalance) VALUES
('0911222333', 'HashPassOwner123', N'Nguyễn Văn Chủ Sân', 'Owner', 10000000.00),
('0988777666', 'HashPassPlayer123', N'Huỳnh Trung Kiên', 'Player', 2000000.00);

-- Tạo một Cụm sân phức hợp tại Tp. Hồ Chí Minh làm mẫu
INSERT INTO Venues (OwnerID, Name, City, District, Address, IsActive) VALUES
(1, N'CLB Thể Thao Phức Hợp Bình Thạnh', N'Hồ Chí Minh', N'Bình Thạnh', N'123 Điện Biên Phủ, Phường 15', 1);

-- Tạo các sân lẻ thuộc cụm sân trên (Bao gồm Pickleball hot-trend và các bộ môn khác)
INSERT INTO Courts (VenueID, SportID, CourtName, PricePerHour, Status) VALUES
(1, 1, N'Sân Cầu Lông Đơn lẻ số 1', 80000.00, 'Available'),
(1, 1, N'Sân Cầu Lông Đơn lẻ số 2', 80000.00, 'Available'),
(1, 2, N'Sân Bóng Đá Mini 5 Người', 350000.00, 'Available'),
(1, 3, N'Sân Pickleball Chuẩn Quốc Tế A', 120000.00, 'Available'),
(1, 5, N'Sân Tennis Kháng Phủ Cao Cấp', 200000.00, 'Available');
GO

PRINT '=======================================================';
PRINT ' CƠ SỞ DỮ LIỆU SPORTBOOKING ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG ';
PRINT '=======================================================';

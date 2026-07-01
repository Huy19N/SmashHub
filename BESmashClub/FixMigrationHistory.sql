-- Script tạo bảng lưu lịch sử của EF Core (nếu bị mất) và chèn mốc Baseline hiện tại
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name='__EFMigrationsHistory')
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

-- Chèn mốc Migration Baseline mà tôi vừa tạo (Bạn có thể bỏ qua nếu đã có sẵn mốc này)
IF NOT EXISTS(SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260701074203_Baseline')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260701074203_Baseline', N'8.0.24');
END;
GO

PRINT 'Da khoi phuc thanh cong lich su EF Core Migrations!'

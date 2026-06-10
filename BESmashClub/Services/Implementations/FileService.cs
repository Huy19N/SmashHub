using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class FileService : IFileService
{
    private readonly UnitOfWork _unitOfWork;

    public FileService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> UploadFileAsync(Guid userId, string fileName, byte[] fileData, string fileType, string purpose, string mimeType)
    {
        // Check local files purposes and types constraints
        var allowedTypes = new[] { "Image", "Video", "Document" };
        var allowedPurposes = new[] { "Avatar", "ChatMedia", "FacilityImage", "General" };

        if (!allowedTypes.Contains(fileType))
            throw new ArgumentException("Mã loại tệp không hợp lệ (Image, Video, Document).");

        if (!allowedPurposes.Contains(purpose))
            throw new ArgumentException("Mục đích tải tệp không hợp lệ.");

        var localFile = new LocalFile
        {
            FileId = Guid.NewGuid(),
            UploadedByUserId = userId,
            FileName = fileName,
            FileData = fileData,
            FileType = fileType,
            FileSizeBytes = fileData.Length,
            MimeType = mimeType,
            Purpose = purpose,
            CreatedAt = DateTime.Now
        };

        var context = _unitOfWork.Users.GetContext();
        await context.Set<LocalFile>().AddAsync(localFile);
        await _unitOfWork.SaveChangesAsync();

        return localFile.FileId;
    }

    public async Task<LocalFile?> GetFileByIdAsync(Guid fileId)
    {
        var context = _unitOfWork.Users.GetContext();
        return await context.Set<LocalFile>()
            .FirstOrDefaultAsync(lf => lf.FileId == fileId);
    }
}

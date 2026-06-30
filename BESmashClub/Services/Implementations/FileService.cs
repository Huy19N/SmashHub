using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class FileService : IFileService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly IMinioClient _minioClient;
    private readonly IConfiguration _config;

    public FileService(UnitOfWork unitOfWork, IMinioClient minioClient, IConfiguration config)
    {
        _unitOfWork = unitOfWork;
        _minioClient = minioClient;
        _config = config;
    }

    public async Task<Guid> UploadFileAsync(Guid userId, string fileName, byte[] fileData, string fileType, string purpose, string mimeType)
    {
        // Check local files purposes and types constraints
        var allowedTypes = new[] { "Image", "Video", "Document" };
        var allowedPurposes = new[] { "Avatar", "ChatMedia", "FacilityImage", "PostMedia", "General" };

        if (!allowedTypes.Contains(fileType))
            throw new ArgumentException("Mã loại tệp không hợp lệ (Image, Video, Document).");

        if (!allowedPurposes.Contains(purpose))
            throw new ArgumentException("Mục đích tải tệp không hợp lệ.");

        var bucketName = _config["MinIOSettings:BucketName"] ?? "smashhub2026";
        var extension = Path.GetExtension(fileName);
        var objectName = $"{purpose}/{Guid.NewGuid()}{extension}";

        bool found = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName));
        if (!found)
        {
            await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucketName));
        }

        using var stream = new MemoryStream(fileData);
        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(mimeType));

        var fileTypeId = (byte)(fileType switch { "Image" => 1, "Video" => 2, "Document" => 3, _ => 1 });
        var purposeId = (byte)(purpose switch { "Avatar" => 1, "FacilityImage" => 2, "ChatMedia" => 3, "PostMedia" => 4, _ => 5 });

        var localFile = new StoredFile
        {
            FileId = Guid.NewGuid(),
            UploadedByUserId = userId,
            OriginalFileName = fileName,
            BucketName = bucketName,
            ObjectName = objectName,
            FileType = fileTypeId,
            FileSizeBytes = fileData.Length,
            MimeType = mimeType,
            Purpose = purposeId,
            CreatedAt = DateTime.Now
        };

        var context = _unitOfWork.Users.GetContext();
        await context.Set<StoredFile>().AddAsync(localFile);
        await _unitOfWork.SaveChangesAsync();

        return localFile.FileId;
    }

    public async Task<StoredFile?> GetFileByIdAsync(Guid fileId)
    {
        var context = _unitOfWork.Users.GetContext();
        return await context.Set<StoredFile>()
            .FirstOrDefaultAsync(lf => lf.FileId == fileId);
    }

    public async Task<string> GetFileUrlAsync(Guid fileId)
    {
        var file = await GetFileByIdAsync(fileId);
        if (file == null) return string.Empty;

        // Return a presigned URL valid for 1 hour
        var args = new PresignedGetObjectArgs()
            .WithBucket(file.BucketName)
            .WithObject(file.ObjectName)
            .WithExpiry(60 * 60);
        
        return await _minioClient.PresignedGetObjectAsync(args);
    }

    public async Task<byte[]> GetFileBytesAsync(Guid fileId)
    {
        var file = await GetFileByIdAsync(fileId);
        if (file == null) return null;

        using var memoryStream = new MemoryStream();
        var args = new GetObjectArgs()
            .WithBucket(file.BucketName)
            .WithObject(file.ObjectName)
            .WithCallbackStream((stream) =>
            {
                stream.CopyTo(memoryStream);
            });
        
        await _minioClient.GetObjectAsync(args);
        return memoryStream.ToArray();
    }
}

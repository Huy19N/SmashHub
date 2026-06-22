using Entites.Models;

namespace Services.Interfaces;

public interface IFileService
{
    Task<Guid> UploadFileAsync(Guid userId, string fileName, byte[] fileData, string fileType, string purpose, string mimeType);
    Task<StoredFile?> GetFileByIdAsync(Guid fileId);
    Task<string> GetFileUrlAsync(Guid fileId);
}

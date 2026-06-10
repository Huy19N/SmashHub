using System.Security.Claims;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Upload file (hình ảnh, video, tài liệu).
    /// </summary>
    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string purpose = "General")
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.ErrorResponse("Tệp tải lên không hợp lệ hoặc rỗng."));

        try
        {
            var userId = GetCurrentUserId();
            var fileName = file.FileName;
            var mimeType = file.ContentType;

            // Determine FileType
            string fileType = "Document";
            if (mimeType.StartsWith("image/"))
                fileType = "Image";
            else if (mimeType.StartsWith("video/"))
                fileType = "Video";

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileData = ms.ToArray();

            var fileId = await _fileService.UploadFileAsync(userId, fileName, fileData, fileType, purpose, mimeType);

            return Ok(ApiResponse<object>.SuccessResponse(new { FileId = fileId, FileName = fileName, FileType = fileType, Purpose = purpose }, "Tải tệp lên thành công."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Xem/Tải file trực tiếp (Public).
    /// </summary>
    [HttpGet("{fileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFile(Guid fileId)
    {
        var localFile = await _fileService.GetFileByIdAsync(fileId);
        if (localFile == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy tệp tin."));

        return File(localFile.FileData, localFile.MimeType ?? "application/octet-stream", localFile.FileName);
    }
}

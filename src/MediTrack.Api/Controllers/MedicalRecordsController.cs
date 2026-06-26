using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.MedicalRecords;
using MediTrack.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/medical-records")]
public class MedicalRecordsController : ControllerBase
{
    private readonly IMedicalRecordService _records;

    public MedicalRecordsController(IMedicalRecordService records) => _records = records;

    [HttpGet("{id:guid}")]
    public Task<MedicalRecordDto> Get(Guid id, CancellationToken ct) => _records.GetByIdAsync(id, ct);

    /// <summary>Streams the original uploaded document (both roles may view).</summary>
    [HttpGet("{id:guid}/file")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        var file = await _records.GetFileAsync(id, ct);
        return File(file.Content, file.ContentType, file.FileName);
    }

    /// <summary>Uploads a document; AI summarization is dispatched asynchronously via Kafka.</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Doctor)]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<MedicalRecordDto>> Upload(
        [FromForm] Guid patientId,
        [FromForm] RecordType recordType,
        IFormFile file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "A non-empty file is required." });

        await using var stream = file.OpenReadStream();
        var dto = await _records.UploadAsync(
            new UploadMedicalRecordRequest(patientId, recordType), file.FileName, stream, ct);
        return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
    }
}

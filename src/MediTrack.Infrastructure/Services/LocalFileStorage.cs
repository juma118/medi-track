using MediTrack.Application.Abstractions;
using Microsoft.Extensions.Options;

namespace MediTrack.Infrastructure.Services;

public class LocalFileStorage : IFileStorage
{
    private readonly string _basePath;

    public LocalFileStorage(IOptions<FileStorageOptions> opt)
    {
        _basePath = Path.GetFullPath(opt.Value.BasePath);
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveAsync(string fileName, Stream content, CancellationToken ct = default)
    {
        var safeName = Path.GetFileName(fileName);
        var blobKey = $"{Guid.NewGuid():N}_{safeName}";
        var fullPath = Path.Combine(_basePath, blobKey);

        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, ct);
        return blobKey;
    }

    public Task<Stream> OpenReadAsync(string blobKey, CancellationToken ct = default)
    {
        var fullPath = Path.Combine(_basePath, Path.GetFileName(blobKey));
        if (!File.Exists(fullPath))
            throw new FileNotFoundException("Stored file not found.", blobKey);
        return Task.FromResult<Stream>(File.OpenRead(fullPath));
    }
}

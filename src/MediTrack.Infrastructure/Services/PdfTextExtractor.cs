using System.Text;
using MediTrack.Application.Abstractions;
using UglyToad.PdfPig;

namespace MediTrack.Infrastructure.Services;

public class PdfTextExtractor : IDocumentTextExtractor
{
    public async Task<string> ExtractTextAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await content.CopyToAsync(ms, ct);
        ms.Position = 0;

        if (!fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            return Encoding.UTF8.GetString(ms.ToArray());
        }

        var sb = new StringBuilder();
        using var doc = PdfDocument.Open(ms);
        foreach (var page in doc.GetPages())
        {
            ct.ThrowIfCancellationRequested();
            sb.AppendLine(page.Text);
        }
        return sb.ToString();
    }
}

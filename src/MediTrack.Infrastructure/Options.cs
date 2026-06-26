namespace MediTrack.Infrastructure;

public class JwtOptions
{
    public string Issuer { get; set; } = "MediTrack";
    public string Audience { get; set; } = "MediTrack";
    public string Key { get; set; } = default!;
    public int AccessTokenMinutes { get; set; } = 60;
}

public class AiOptions
{
    public string Provider { get; set; } = "stub";      // openai | claude | stub
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "gpt-4o-mini";
    public string BaseUrl { get; set; } = "";
}

public class FileStorageOptions
{
    public string BasePath { get; set; } = "storage";
}

public class KafkaOptions
{
    public string BootstrapServers { get; set; } = "localhost:9092";
}

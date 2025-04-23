using System.Text.Json.Serialization;

namespace MigdalorServer.BL
{
    public class ExpoPushMessage
    {
        [JsonPropertyName("to")]
        public string To { get; set; } = default!;

        [JsonPropertyName("sound")]
        public string Sound { get; set; } = "default";

        [JsonPropertyName("title")]
        public string Title { get; set; } = default!;

        [JsonPropertyName("body")]
        public string Body { get; set; } = default!;

        [JsonPropertyName("badge")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Badge { get; set; }

        [JsonPropertyName("data")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public object? Data { get; set; }
    }
}

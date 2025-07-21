public class ScheduleOverrideDto
{
    public int OverrideId { get; set; }
    public int ServiceId { get; set; }
    public DateTime OverrideDate { get; set; }
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; } // Nullable, for "hh:mm" format
    public string? CloseTime { get; set; } // Nullable, for "hh:mm" format
    public string Notes { get; set; }
}

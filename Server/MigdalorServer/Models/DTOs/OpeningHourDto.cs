namespace Migdalor.DTOs
{
    public class OpeningHourDto
    {
        public int HourId { get; set; }
        public int ServiceId { get; set; }
        public int DayOfWeek { get; set; }
        public string OpenTime { get; set; } // Using string for "hh:mm" format
        public string CloseTime { get; set; } // Using string for "hh:mm" format
    }
}
using Microsoft.Extensions.Hosting;

namespace MigdalorServer.BL
{
    public class Classes : Activities
    {
        private bool isRecurring;
        private int recurrenceLevel;
        private string recurrenceDetails;
        private int sessionAmount;

        public Classes(int activityID, string activityName, DateTime startDate, int capacity, int hostID, string location, int picID, bool isRecurring, int recurrenceLevel, string recurrenceDetails, int sessionAmount) : base ( activityID, activityName, startDate,capacity,  hostID, location, picID)
        {
            IsRecurring = isRecurring;
            RecurrenceLevel = recurrenceLevel;
            RecurrenceDetails = recurrenceDetails;
            SessionAmount = sessionAmount;
        }

        public bool IsRecurring { get => isRecurring; set => isRecurring = value; }
        public int RecurrenceLevel { get => recurrenceLevel; set => recurrenceLevel = value; }
        public string RecurrenceDetails { get => recurrenceDetails; set => recurrenceDetails = value; }
        public int SessionAmount { get => sessionAmount; set => sessionAmount = value; }
    }
}

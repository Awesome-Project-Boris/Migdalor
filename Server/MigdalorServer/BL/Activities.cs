namespace MigdalorServer.BL
{
    public class Activities
    {
        private int activityID;
        private string activityName;
        private DateTime startDate;
        private int capacity;
        private int hostID;
        private string location;
        private int picID;

        public Activities(int activityID, string activityName, DateTime startDate, int capacity, int hostID, string location, int picID)
        {
            this.activityID = activityID;
            this.activityName = activityName;
            this.startDate = startDate;
            this.capacity = capacity;
            this.hostID = hostID;
            this.location = location;
            this.picID = picID;
        }

        public int ActivityID { get => activityID; set => activityID = value; }
        public string ActivityName { get => activityName; set => activityName = value; }
        public DateTime StartDate { get => startDate; set => startDate = value; }
        public int Capacity { get => capacity; set => capacity = value; }
        public int HostID { get => hostID; set => hostID = value; }
        public string Location { get => location; set => location = value; }
        public int PicID { get => picID; set => picID = value; }
    }
}
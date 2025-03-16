using Microsoft.Data.SqlClient;
using System.Diagnostics;

namespace MigdalorServer.BL
{
    public class Activity
    {
        private int activityID;
        private string activityName;
        private DateTime startDate;
        private int capacity;
        private int hostID;
        private string location;
        private int picID;

        public Activity() { }
        public Activity(int activityID, string activityName, DateTime startDate, int capacity, int hostID, string location, int picID)
        {
            ActivityID = activityID;
            ActivityName = activityName;
            StartDate = startDate;
            Capacity = capacity;
            HostID = hostID;
            Location = location;
            PicID = picID;
        }

        public int ActivityID { get => activityID; set => activityID = value; }
        public string ActivityName { get => activityName; set => activityName = value; }
        public DateTime StartDate { get => startDate; set => startDate = value; }
        public int Capacity { get => capacity; set => capacity = value; }
        public int HostID { get => hostID; set => hostID = value; }
        public string Location { get => location; set => location = value; }
        public int PicID { get => picID; set => picID = value; }

        public static Activity CreateActivityFromReader(SqlDataReader reader)
        {
            return new Activity
            {
                ActivityID = Convert.ToInt32(reader["activityID"]),
                ActivityName = reader["activityName"] == DBNull.Value ? null : (string)reader["activityName"],
                StartDate = Convert.ToDateTime(reader["startDate"]),
                Capacity = reader["capacity"] == DBNull.Value ? 0 : Convert.ToInt32(reader["capacity"]),
                HostID = reader["hostID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["hostID"]),
                Location = reader["location"] == DBNull.Value ? null : (string)reader["location"],
                PicID = reader["PicID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["PicID"])
            };
        }

        

    }
}
using Microsoft.Data.SqlClient;
namespace MigdalorServer.BL
{
    public class Resident : Person
    {
        private bool hasLoggedIn;
        private bool isActive;
        private bool isBokerTov;
        private bool canInitActivity;
        private int spouseID;
        private DateTime arrivalDate;
        private string branchName;
        private string homePlace;
        private string phoneNumber;
        private string profession;
        private string description;
        private int pic1id;
        private int pic2id;

        public Resident() { }
        public Resident(int id, string hebFirstName, string hebLastName, string engFirstName, string engLastName, string gender, string email, DateOnly birthDate, int profilePicID, int age, bool hasLoggedIn, bool isActive, bool isBokerTov, bool canInitActivity, int spouseID, DateTime arrivalDate, string branchName, string homePlace, string phoneNumber, string profession, string description, int pic1id, int pic2id) : base(id,hebFirstName,hebLastName,engFirstName,engLastName,gender,email, birthDate, profilePicID, age)
        {
            this.HasLoggedIn = hasLoggedIn;
            this.IsActive = isActive;
            this.IsBokerTov = isBokerTov;
            this.CanInitActivity = canInitActivity;
            this.SpouseID = spouseID;
            this.ArrivalDate = arrivalDate;
            this.BranchName = branchName;
            this.HomePlace = homePlace;
            this.PhoneNumber = phoneNumber;
            this.Profession = profession;
            this.Description = description;
            this.Pic1id = pic1id;
            this.Pic2id = pic2id;
        }

        public bool HasLoggedIn { get => hasLoggedIn; set => hasLoggedIn = value; }
        public bool IsActive { get => isActive; set => isActive = value; }
        public bool IsBokerTov { get => isBokerTov; set => isBokerTov = value; }
        public bool CanInitActivity { get => canInitActivity; set => canInitActivity = value; }
        public int SpouseID { get => spouseID; set => spouseID = value; }
        public DateTime ArrivalDate { get => arrivalDate; set => arrivalDate = value; }
        public string BranchName { get => branchName; set => branchName = value; }
        public string HomePlace { get => homePlace; set => homePlace = value; }
        public string PhoneNumber { get => phoneNumber; set => phoneNumber = value; }
        public string Profession { get => profession; set => profession = value; }
        public string Description { get => description; set => description = value; }
        public int Pic1id { get => pic1id; set => pic1id = value; }
        public int Pic2id { get => pic2id; set => pic2id = value; }
    }
}

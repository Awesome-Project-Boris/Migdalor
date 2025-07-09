namespace MigdalorServer.Models.DTOs
{
    public class UpdateResidentDto
    {
        // From OhPerson
        public string PhoneNumber { get; set; }
        public string HebFirstName { get; set; }
        public string HebLastName { get; set; }
        public string EngFirstName { get; set; }
        public string EngLastName { get; set; }
        public string Gender { get; set; }
        public int? ProfilePicId { get; set; }
        public string Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PersonRole { get; set; }

        // From OhResident
        public string BranchName { get; set; }
        public bool? IsBokerTov { get; set; }
        public bool CanInitActivity { get; set; }
        public Guid? SpouseId { get; set; }
        public DateTime DateOfArrival { get; set; }
        public string HomePlace { get; set; }
        public string Profession { get; set; }
        public string ResidentDescription { get; set; }
    }
}

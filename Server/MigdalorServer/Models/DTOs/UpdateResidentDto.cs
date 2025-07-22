// In a new file, e.g., Models/DTOs/UpdateResidentDto.cs
namespace MigdalorServer.Models.DTOs
{
    public class UpdateResidentDto
    {
        // Properties from OH_People
        public string? HebFirstName { get; set; }
        public string? HebLastName { get; set; }
        public string? EngFirstName { get; set; }
        public string? EngLastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? PersonRole { get; set; }
        public int? ProfilePicId { get; set; }

        // Properties from OH_Residents
        public string? BranchName { get; set; }
        public bool? IsBokerTov { get; set; }
        public bool? CanInitActivity { get; set; }
        public Guid? SpouseId { get; set; }
        public DateTime? DateOfArrival { get; set; }
        public string? HomePlace { get; set; }
        public string? Profession { get; set; }
        public string? ResidentDescription { get; set; }
        public bool? IsCommittee { get; set; }
        public string? HebCommitteeName { get; set; }
        public string? EngCommitteeName { get; set; }
    }
}

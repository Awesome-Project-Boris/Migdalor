using System;

namespace MigdalorServer.Models.DTOs
{
    // This DTO is used to send updated information for an instructor's profile.
    public class UpdateInstructorProfileDto
    {
        // The unique identifier for the person (instructor) being updated.
        public Guid PersonId { get; set; }

        public string PhoneNumber { get; set; } = "";

        public string Email { get; set; } = "";

        public int? ProfilePicId { get; set; }
    }
}

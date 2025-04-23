using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhResident
    {
        public OhResident() { }

        public OhResident(OhPerson user)
        {
            ResidentId = user.PersonId;
            HasLoggedIn = false;
            IsActive = true;
            BranchName = "נורדיה";
            IsBokerTov = true;
            CanInitActivity = false;
            SpouseId = null;
            SpouseHebName = null;
            SpouseEngName = null;
            DateOfArrival = DateOnly.FromDateTime(DateTime.Now);
            HomePlace = null;
            Profession = null;
            ResidentDescription = null;
            AdditionalPic1Id = null;
            AdditionalPic2Id = null;
            ResidentApartmentNumber = null;

        }
    }
}

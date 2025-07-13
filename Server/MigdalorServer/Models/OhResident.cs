using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhResident
    {
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
            DateOfArrival = DateTime.Now.Date;
            HomePlace = null;
            Profession = null;
            ResidentDescription = null;
            AdditionalPic1Id = null;
            AdditionalPic2Id = null;
            ResidentApartmentNumber = null;

        }

        public static async Task<List<object>> GetAllResidentsDetailsAsync()
        {
            using var context = new MigdalorDBContext();

            var residentsDetails = await (from resident in context.OhResidents
                                          join person in context.OhPeople on resident.ResidentId equals person.PersonId
                                          select new
                                          {
                                              Id = person.PersonId,
                                              HebFirstName = person.HebFirstName,
                                              HebLastName = person.HebLastName,
                                              EngFirstName = person.EngFirstName,
                                              EngLastName = person.EngLastName,
                                              FullName = person.HebFirstName + " " + person.HebLastName,
                                              Email = person.Email,
                                              Gender = person.Gender,
                                              PhoneNumber = person.PhoneNumber,
                                              RoomNumber = resident.ResidentApartmentNumber,
                                              IsActive = resident.IsActive,
                                              DateOfArrival = resident.DateOfArrival
                                          }).ToListAsync();

            return residentsDetails.Cast<object>().ToList();
        }

        public static async Task<bool> UpdateResidentAsync(Guid id, UpdateResidentDto residentDto)
        {
            using var context = new MigdalorDBContext();
            var person = await context.OhPeople.FindAsync(id);
            var resident = await context.OhResidents.FindAsync(id);

            if (person == null || resident == null)
            {
                // The resident or person record does not exist.
                return false;
            }

            // Update OhPerson properties if new values are provided in the DTO.
            if (!string.IsNullOrEmpty(residentDto.PhoneNumber)) person.PhoneNumber = residentDto.PhoneNumber;
            if (!string.IsNullOrEmpty(residentDto.HebFirstName)) person.HebFirstName = residentDto.HebFirstName;
            if (!string.IsNullOrEmpty(residentDto.HebLastName)) person.HebLastName = residentDto.HebLastName;
            if (!string.IsNullOrEmpty(residentDto.EngFirstName)) person.EngFirstName = residentDto.EngFirstName;
            if (!string.IsNullOrEmpty(residentDto.EngLastName)) person.EngLastName = residentDto.EngLastName;
            if (!string.IsNullOrEmpty(residentDto.Gender)) person.Gender = residentDto.Gender;
            if (residentDto.ProfilePicId.HasValue) person.ProfilePicId = residentDto.ProfilePicId;
            if (!string.IsNullOrEmpty(residentDto.Email)) person.Email = residentDto.Email;
            if (residentDto.DateOfBirth.HasValue) person.DateOfBirth = residentDto.DateOfBirth.Value;
            if (!string.IsNullOrEmpty(residentDto.PersonRole)) person.PersonRole = residentDto.PersonRole;

            // Update OhResident properties if new values are provided in the DTO.
            if (!string.IsNullOrEmpty(residentDto.BranchName)) resident.BranchName = residentDto.BranchName;
            if (residentDto.IsBokerTov.HasValue) resident.IsBokerTov = residentDto.IsBokerTov.Value;
            if (residentDto.CanInitActivity != resident.CanInitActivity) resident.CanInitActivity = (bool)residentDto.CanInitActivity;
            if (residentDto.SpouseId.HasValue) resident.SpouseId = residentDto.SpouseId;
            if (residentDto.DateOfArrival != default) resident.DateOfArrival = (DateTime)residentDto.DateOfArrival;
            if (!string.IsNullOrEmpty(residentDto.HomePlace)) resident.HomePlace = residentDto.HomePlace;
            if (!string.IsNullOrEmpty(residentDto.Profession)) resident.Profession = residentDto.Profession;
            if (!string.IsNullOrEmpty(residentDto.ResidentDescription)) resident.ResidentDescription = residentDto.ResidentDescription;

            // Save all the changes to the database.
            await context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Deactivates a resident by setting their IsActive flag to false (soft delete).
        /// </summary>
        /// <param name="id">The GUID of the resident to deactivate.</param>
        /// <returns>True if the deactivation was successful, false if the resident was not found.</returns>
        public static async Task<bool> DeactivateResidentAsync(Guid id)
        {
            using var context = new MigdalorDBContext();
            var resident = await context.OhResidents.FindAsync(id);

            if (resident == null)
            {
                // The resident does not exist.
                return false;
            }

            // Mark the resident as inactive.
            resident.IsActive = false;
            await context.SaveChangesAsync();
            return true;
        }
    }
}

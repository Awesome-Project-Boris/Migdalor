using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhPerson
    {
        public OhPerson(UserRegister user)
        {
            PasswordHash = PasswordServices.CreatePasswordHash(user.Password);
            HebFirstName = user.HebFirstName;
            HebLastName = user.HebLastName;
            EngFirstName = user.EngFirstName;
            EngLastName = user.EngLastName;
            PhoneNumber = user.PhoneNumber;
            Gender = user.Gender;
        }

        public static OhPerson GetUserByPhone(string phoneNumber)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            OhPerson user = db.OhPeople.Where(u => u.PhoneNumber == phoneNumber).FirstOrDefault()!;
            if (user is null)
                throw new Exception("User not found");
            else
                return user;
        }

        //public static OhPerson GetPersonByIDForProfile(Guid ID)
        public static dynamic GetPersonByIDForProfile(Guid ID)
        {
            //using MigdalorDBContext db = new MigdalorDBContext();
            using var db = new MigdalorDBContext();

            //Console.WriteLine($"[DEBUG] Incoming ID: {ID}");
            var directPerson = db.OhPeople.Find(ID);
            //Console.WriteLine(directPerson == null
            //    ? "[DEBUG] OhPeople.Find returned null"
            //    : $"[DEBUG] OhPeople.Find succeeded: {directPerson.HebFirstName} {directPerson.HebLastName}");


            var result = (
                from person in db.OhPeople

                // 1) find their resident record
                join resident in db.OhResidents on person.PersonId equals resident.ResidentId

                // 2) left‑join into OhPeople again for the spouse
                join spouse in db.OhPeople on resident.SpouseId equals spouse.PersonId into spGroup
                from s in spGroup.DefaultIfEmpty()

                // LEFT JOIN to privacy settings
                join privacy in db.OhPrivacySettings on person.PersonId equals privacy.PersonId into privacyGroup
                from ps in privacyGroup.DefaultIfEmpty()

                // 3) filter to the one you want
                where person.PersonId == ID

                // join into profile picture (left)
                join profPic in db.OhPictures
                    on person.ProfilePicId equals profPic.PicId
                    into profPicGroup
                from pp in profPicGroup.DefaultIfEmpty()

                // join into additional picture 1 (left)
                join add1 in db.OhPictures
                    on resident.AdditionalPic1Id equals add1.PicId
                    into add1Group
                from p1 in add1Group.DefaultIfEmpty()

                // join into additional picture 2 (left)
                join add2 in db.OhPictures
                    on resident.AdditionalPic2Id equals add2.PicId
                    into add2Group
                from p2 in add2Group.DefaultIfEmpty()

                // 4) project everything you need, including spouse names
                select new
                {
                    // --- from OH_People ---
                    id = person.PersonId,
                    phoneNumber = person.PhoneNumber,
                    hebName = person.HebFirstName + " " + person.HebLastName,
                    engName = person.EngFirstName + " " + person.EngLastName,
                    //profilePicID = person.ProfilePicId,
                    email = person.Email,

                    // --- from OH_Residents ---
                    dateOfArrival = resident.DateOfArrival,
                    homePlace = resident.HomePlace,
                    profession = resident.Profession,
                    residentDescription = resident.ResidentDescription,
                    //additionalPic1ID = resident.AdditionalPic1Id,
                    //additionalPic2ID = resident.AdditionalPic2Id,
                    residentApartmentNumber = resident.ResidentApartmentNumber,

                    // --- spouse info (may be null) ---
                    spouseId = resident.SpouseId,
                    spouseHebName = resident.SpouseHebName,
                    spouseEngName = resident.SpouseEngName,

                    // profile‑picture data (or null)
                    profilePicture = pp == null
                        ? null
                        : new
                        {
                            pp.PicId,
                            pp.PicName,
                            pp.PicPath,
                            pp.PicAlt,
                            //pp.UploaderId,
                            //pp.PicRole,
                            //pp.ListingId,
                            //pp.DateTime
                        },

                    // additional pic #1 (or null)
                    additionalPicture1 = p1 == null
                        ? null
                        : new
                        {
                            p1.PicId,
                            p1.PicName,
                            p1.PicPath,
                            p1.PicAlt,
                            //p1.UploaderId,
                            //p1.PicRole,
                            //p1.ListingId,
                            //p1.DateTime
                        },

                    // additional pic #2 (or null)
                    additionalPicture2 = p2 == null
                        ? null
                        : new
                        {
                            p2.PicId,
                            p2.PicName,
                            p2.PicPath,
                            p2.PicAlt,
                            //p2.UploaderId,
                            //p2.PicRole,
                            //p2.ListingId,
                            //p2.DateTime
                        },

                    residentInterests = resident.InterestNames.Select(i => new { name = i.InterestName }).ToList()
                    // Project the privacy settings. If 'ps' is null (no record exists),
                    // create a new DTO with default values. Otherwise, use the value from 'ps',
                    // providing 'true' as a fallback if any individual property is null.
                    privacySettings = ps == null ? new PrivacySettingsDto() : new PrivacySettingsDto
                        {
                            ShowPartner = ps.ShowPartner ?? true,
                            ShowApartmentNumber = ps.ShowApartmentNumber ?? true,
                            ShowMobilePhone = ps.ShowMobilePhone ?? true,
                            ShowEmail = ps.ShowEmail ?? true,
                            ShowArrivalYear = ps.ShowArrivalYear ?? true,
                            ShowOrigin = ps.ShowOrigin ?? true,
                            ShowProfession = ps.ShowProfession ?? true,
                            ShowInterests = ps.ShowInterests ?? true,
                            ShowAboutMe = ps.ShowAboutMe ?? true,
                            ShowProfilePicture = ps.ShowProfilePicture ?? true,
                            ShowAdditionalPictures = ps.ShowAdditionalPictures ?? true
                        },
                }
            ).FirstOrDefault();

            //var json = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            //Console.WriteLine(json);

            if (result == null)
                throw new Exception("User not found");

            return result;
        }

        public static async Task UpdateProfileAndPrivacyAsync(UpdateProfileRequestDto request)

        {
            using var db = new MigdalorDBContext();
            var person = await db.OhPeople.FindAsync(request.PersonId);
            var resident = await db.OhResidents.FindAsync(request.PersonId);
            if (person == null || resident == null)
            {
                throw new Exception("Person or Resident not found");
            }
            // Update person and resident fields from the DTO
            person.Email = request.Email;
            resident.ResidentApartmentNumber = request.ResidentApartmentNumber;
            resident.HomePlace = request.Origin;
            resident.Profession = request.Profession;
            resident.ResidentDescription = request.AboutMe;
            // Add any other fields you need to update here...
            // Handle the "Upsert" (Update or Insert) logic for privacy settings
            if (request.PrivacySettings != null)
            {
                var existingSettings = await db.OhPrivacySettings.FindAsync(request.PersonId);
                if (existingSettings != null)
                {
                    // If settings exist, update them
                    existingSettings.ShowPartner = request.PrivacySettings.ShowPartner;
                    existingSettings.ShowApartmentNumber = request.PrivacySettings.ShowApartmentNumber;
                    existingSettings.ShowMobilePhone = request.PrivacySettings.ShowMobilePhone;
                    existingSettings.ShowEmail = request.PrivacySettings.ShowEmail;
                    existingSettings.ShowArrivalYear = request.PrivacySettings.ShowArrivalYear;
                    existingSettings.ShowOrigin = request.PrivacySettings.ShowOrigin;
                    existingSettings.ShowProfession = request.PrivacySettings.ShowProfession;
                    existingSettings.ShowInterests = request.PrivacySettings.ShowInterests;
                    existingSettings.ShowAboutMe = request.PrivacySettings.ShowAboutMe;
                    existingSettings.ShowProfilePicture = request.PrivacySettings.ShowProfilePicture;
                    existingSettings.ShowAdditionalPictures = request.PrivacySettings.ShowAdditionalPictures;
                }
                else
                {
                    // If settings don't exist, create a new record
                    var newSettings = new OhPrivacySetting
                    {
                        PersonId = request.PersonId,
                        ShowPartner = request.PrivacySettings.ShowPartner,
                        ShowApartmentNumber = request.PrivacySettings.ShowApartmentNumber,
                        ShowMobilePhone = request.PrivacySettings.ShowMobilePhone,
                        ShowEmail = request.PrivacySettings.ShowEmail,
                        ShowArrivalYear = request.PrivacySettings.ShowArrivalYear,
                        ShowOrigin = request.PrivacySettings.ShowOrigin,
                        ShowProfession = request.PrivacySettings.ShowProfession,
                        ShowInterests = request.PrivacySettings.ShowInterests,
                        ShowAboutMe = request.PrivacySettings.ShowAboutMe,
                        ShowProfilePicture = request.PrivacySettings.ShowProfilePicture,
                        ShowAdditionalPictures = request.PrivacySettings.ShowAdditionalPictures
                    };
                    db.OhPrivacySettings.Add(newSettings);
                }
            }
            await db.SaveChangesAsync();
        }


        public static async Task<List<ResidentDigest>> GetActiveResidentDigestsAsync(
    MigdalorDBContext context
)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            // Rewrite the query using the more compatible "query syntax"
            var query = from person in context.OhPeople
                        join resident in context.OhResidents on person.PersonId equals resident.ResidentId
                        where resident.IsActive == true

                        // Perform a LEFT JOIN to the pictures table
                        join pic in context.OhPictures on person.ProfilePicId equals pic.PicId into pictureGroup
                        from profilePic in pictureGroup.DefaultIfEmpty()

                            // Project the final result directly into the DTO
                        select new ResidentDigest
                        {
                            UserId = person.PersonId,
                            HebFirstName = person.HebFirstName,
                            HebLastName = person.HebLastName,
                            EngFirstName = person.EngFirstName,
                            EngLastName = person.EngLastName,

                            // Replicate the original logic to safely construct the PhotoUrl
                            PhotoUrl =
                                (
                                    profilePic != null
                                    && !string.IsNullOrEmpty(profilePic.PicPath)
                                    && !string.IsNullOrEmpty(profilePic.PicName)
                                )
                                ? $"{profilePic.PicPath.TrimEnd('/')}/{profilePic.PicName.TrimStart('/')}"
                                : null
                        };

            var digests = await query.ToListAsync();

            return digests;
        }

        // --- Add other static resident-related logic methods here if needed ---



        public static OhPerson AddUser(UserRegister user)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            OhPerson newUser = new OhPerson(user);
            db.OhPeople.Add(newUser);
            db.SaveChanges();
            db.OhResidents.Add(new OhResident(newUser));
            db.OhUserSettings.Add(new OhUserSetting(newUser));
            db.SaveChanges();
            return newUser;
        }

        public static OhPerson AuthenticateUser(UserLogin login)
        {
            OhPerson user = GetUserByPhone(login.PhoneNumber);
            bool isPasswordValid = PasswordServices.VerifyPassword(
                login.Password,
                user.PasswordHash
            );
            if (!isPasswordValid)
            {
                throw new Exception("Wrong password");
            }
            return user;
        }

        public static string GetUserPasswordHash(string username)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            return db.OhPeople.Find(username)?.PasswordHash ?? "";
        }

        public static Guid[] GetAllUserIds()
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            return db.OhPeople.Select(u => u.PersonId).ToArray();
        }

        public static bool IsAdmin(Guid userId)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            var user = db.OhPeople.Find(userId);
            if (user == null)
                throw new Exception("User not found");
            return user?.PersonRole?.ToLower() == "admin";
        }
    }
}

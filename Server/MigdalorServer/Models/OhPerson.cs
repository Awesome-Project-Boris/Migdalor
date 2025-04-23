using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhPerson
    {
        public OhPerson() { }

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
                }
            ).FirstOrDefault();

            //var json = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            //Console.WriteLine(json);

            if (result == null)
                throw new Exception("User not found");

            return result;
        }

        public static async Task<List<ResidentDigest>> GetActiveResidentDigestsAsync(
            MigdalorDBContext context
        ) // Removed imageBaseUrl parameter
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));
            // Removed check for imageBaseUrl

            // Explicitly join OhResidents, OhPeople, and OhPictures
            var query = context
                .OhResidents.Where(r => r.IsActive)
                .Join(
                    context.OhPeople,
                    resident => resident.ResidentId,
                    person => person.PersonId,
                    (resident, person) => new { resident, person }
                )
                .GroupJoin(
                    context.OhPictures,
                    rp => rp.person.ProfilePicId,
                    picture => picture.PicId,
                    (residentPersonPair, pictures) =>
                        new
                        {
                            residentPersonPair.resident,
                            residentPersonPair.person,
                            picture = pictures.FirstOrDefault(),
                        }
                );

            // Project the final result into the DTO
            var digests = await query
                .Select(joined => new ResidentDigest
                {
                    UserId = joined.person.PersonId,
                    HebFirstName = joined.person.HebFirstName,
                    HebLastName = joined.person.HebLastName,
                    EngFirstName = joined.person.EngFirstName,
                    EngLastName = joined.person.EngLastName,

                    // Construct relative PhotoUrl: Combine Path and Name
                    PhotoUrl =
                        (
                            joined.picture != null
                            && !string.IsNullOrEmpty(joined.picture.PicPath)
                            && !string.IsNullOrEmpty(joined.picture.PicName)
                        )
                            // Combine path and name. Ensure no double slashes.
                            ? $"{joined.picture.PicPath.TrimEnd('/')}/{joined.picture.PicName.TrimStart('/')}"
                            // Alternative using Path.Combine (might behave differently on non-Windows if paths have backslashes)
                            // ? Path.Combine(joined.picture.PicPath, joined.picture.PicName).Replace("\\", "/") // Ensure forward slashes for URL
                            : null, // Set to null if picture or path/name is missing
                })
                .ToListAsync();

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

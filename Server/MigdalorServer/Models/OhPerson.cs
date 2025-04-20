using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;
using System.Text.Json;

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

            Console.WriteLine($"[DEBUG] Incoming ID: {ID}");
            var directPerson = db.OhPeople.Find(ID);
            Console.WriteLine(directPerson == null
                ? "[DEBUG] OhPeople.Find returned null"
                : $"[DEBUG] OhPeople.Find succeeded: {directPerson.HebFirstName} {directPerson.HebLastName}");


            var result = (
                from person in db.OhPeople

                // 1) find their resident record
                join resident in db.OhResidents
                    on person.PersonId equals resident.ResidentId

                // 2) left‑join into OhPeople again for the spouse
                join spouse in db.OhPeople
                    on resident.SpouseId equals spouse.PersonId into spGroup
                from s in spGroup.DefaultIfEmpty()

                // 3) filter to the one you want
                where person.PersonId == ID

                // 4) project everything you need, including spouse names
                select new
                {
                    // --- from OH_People ---
                    id = person.PersonId,
                    phoneNumber = person.PhoneNumber,
                    hebName = person.HebFirstName + " " + person.HebLastName,
                    engFirstName = person.EngFirstName + " " + person.EngLastName,
                    profilePicID = person.ProfilePicId,
                    email = person.Email,

                    // --- from OH_Residents ---
                    dateOfArrival = resident.DateOfArrival,
                    homePlace = resident.HomePlace,
                    profession = resident.Profession,
                    residentDescription = resident.ResidentDescription,
                    additionalPic1ID = resident.AdditionalPic1Id,
                    additionalPic2ID = resident.AdditionalPic2Id,

                    // --- spouse info (may be null) ---
                    spouseId = resident.SpouseId,
                    spouseHebName = s == null ? null : s.HebFirstName + " " + s.HebLastName,
                    spouseEngName = s == null ? null : s.EngFirstName + " " + s.EngLastName
                }
            ).FirstOrDefault();

            var json = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            Console.WriteLine(json);

            if (result == null)
                throw new Exception("User not found");

            return result;
        }

        public static OhPerson AddUser(UserRegister user)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            OhPerson newUser = new OhPerson(user);
            db.OhPeople.Add(newUser);
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
    }
}

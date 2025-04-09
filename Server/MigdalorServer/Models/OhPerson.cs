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

using Microsoft.Data.SqlClient;
namespace MigdalorServer.BL
{
    public class Person
    {
        private int id;
        private string hebFirstName;
        private string hebLastName;
        private string engFirstName;
        private string engLastName;
        private string gender;
        private string email;
        private DateOnly birthDate;
        private int profilePicID;
        private int age;

        public Person() { }
        public Person(int id, string hebFirstName, string hebLastName, string engFirstName, string engLastName, string gender, string email, string birthDate, int profilePicID, int age)
        {
            Id = id;
            HebFirstName = hebFirstName;
            HebLastName = hebLastName;
            EngFirstName = engFirstName;
            EngLastName = engLastName;
            Gender = gender;
            Email = email;
            BirthDate = birthDate;
            ProfilePicID = profilePicID;
            Age = age;
        }

        public int Id { get => id; set => id = value; }
        public string HebFirstName { get => hebFirstName; set => hebFirstName = value; }
        public string HebLastName { get => hebLastName; set => hebLastName = value; }
        public string EngFirstName { get => engFirstName; set => engFirstName = value; }
        public string EngLastName { get => engLastName; set => engLastName = value; }
        public string Gender { get => gender; set => gender = value; }
        public string Email { get => email; set => email = value; }
        public string BirthDate { get => birthDate; set => birthDate = value; }
        public int ProfilePicID { get => profilePicID; set => profilePicID = value; }
        public int Age { get => age; set => age = value; }
    }
}

namespace MigdalorServer.Models
{
    public partial class OhUserSetting
    {
        public OhUserSetting() { }

        public OhUserSetting(OhPerson person)
        {
            UserId = person.PersonId;
        }
    }
}

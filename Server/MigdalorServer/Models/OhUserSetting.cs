using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhUserSetting
    {
        public OhUserSetting() { }

        public OhUserSetting(OhPerson person)
        {
            UserId = person.PersonId;
        }

        public OhUserSetting(UserSetting userSetting)
        {
            UserId = userSetting.UserId;
            UserSelectedDirection = userSetting.UserSelectedDirection;
            UserSelectedFontSize = userSetting.UserSelectedFontSize;
            UserSelectedLanguage = userSetting.UserSelectedLanguage;
        }
    }
}

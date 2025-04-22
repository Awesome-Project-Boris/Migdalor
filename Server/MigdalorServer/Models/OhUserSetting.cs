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

        //public OhUserSetting(Guid userID, UserSetting userSetting)
        //{
        //    UserId = userID;
        //    UserSelectedDirection = userSetting.UserSelectedDirection;
        //    UserSelectedFontSize = userSetting.UserSelectedFontSize;
        //    UserSelectedLanguage = userSetting.UserSelectedLanguage;
        //}
    }
}

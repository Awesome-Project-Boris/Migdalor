namespace BookStore.BL
{
    public class Author
    {
        string name;
        string summary;
        string image;
        string link;

        public Author(string name, string summary, string image, string link)
        {
            this.Name = name;
            this.Summary = summary;
            this.Image = image;
            this.Link = link;
        }

        public Author() { }

        static public Object GetAuthorAndBooksByAuthorAdHoc(int authorId)
        {
            DBservices dbs = new DBservices();
            return dbs.GetAuthorAndBooksByAuthorAdHoc(authorId);
        }

        static public Object GetAuthorDataForAdminTable()
        {
            DBservices dbs = new DBservices();
            return dbs.GetAuthorDataForAdminTable();
        }

        static public Object GetAllWritersDisplayAdHoc()
        {
            DBservices dbs = new DBservices();
            return dbs.GetAllWritersDisplayAdHoc();
        }

        static public bool SubmitForumPost(int AuthorID, int UserID, string Header, string Content, int ResponseToPostID)
        {
            DBservices dbs = new DBservices();
            return dbs.SubmitForumPost(AuthorID, UserID, Header, Content, ResponseToPostID);
        }

        static public Object GetAuthorsByName(string query)
        {
            DBservices dbs = new DBservices();
            return dbs.GetAuthorsByName(query);
        }

        static public Object GetAllForumPosts(int AuthorID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetAllForumPosts(AuthorID);
        }


        static public Object Load100ChatMessages(int AuthorID, int Offset)
        {
            DBservices dbs = new DBservices();
            return dbs.Load100ChatMessages(AuthorID, Offset);
        }

        static public Object LoadLastChatMessage(int AuthorID)
        {
            DBservices dbs = new DBservices();
            return dbs.LoadLastChatMessage(AuthorID);
        }

        static public bool DoesAuthorExistInDB(string AuthorName)
        {
            DBservices dbs = new DBservices();
            return dbs.DoesAuthorExistInDB(AuthorName);
        }

        static public bool InsertNewAuthorAndConnectToBook(string AuthorName, string Summary, string Image, string Link, int BookID)
        {
            DBservices dbs = new DBservices();
            return dbs.InsertNewAuthorAndConnectToBook(AuthorName, Summary, Image, Link, BookID);
        }



        static public Object GetChatMessageByChatMessagIDAndAuthorID(int AuthorID, int MessageID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetChatMessageByChatMessagIDAndAuthorID(AuthorID, MessageID);
        }

        public string Name { get => name; set => name = value; }
        public string Summary { get => summary; set => summary = value; }
        public string Image { get => image; set => image = value; }
        public string Link { get => link; set => link = value; }
    }
}

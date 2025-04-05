using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MigdalorServer.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OH_Categories",
                columns: table => new
                {
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Categ__8517B2E13E0D2B85", x => x.CategoryName);
                });

            migrationBuilder.CreateTable(
                name: "OH_Permissions",
                columns: table => new
                {
                    permissionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Permi__70661EFD0FB17EC0", x => x.permissionName);
                });

            migrationBuilder.CreateTable(
                name: "OH_Pictures",
                columns: table => new
                {
                    picID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    picName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    picPath = table.Column<string>(type: "varchar(max)", unicode: false, nullable: false),
                    picAlt = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Pictu__06707FCD5CA26DEA", x => x.picID);
                });

            migrationBuilder.CreateTable(
                name: "OH_Rooms",
                columns: table => new
                {
                    roomNumber = table.Column<int>(type: "int", nullable: false),
                    buildingNumber = table.Column<int>(type: "int", nullable: false),
                    roomName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    capacity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Rooms__CD87FECFF4277B52", x => new { x.roomNumber, x.buildingNumber });
                });

            migrationBuilder.CreateTable(
                name: "OH_People",
                columns: table => new
                {
                    personID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    hebFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    hebLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    engFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    engLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    profilePicID = table.Column<int>(type: "int", nullable: true),
                    email = table.Column<string>(type: "varchar(2048)", unicode: false, maxLength: 2048, nullable: true),
                    dateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    gender = table.Column<string>(type: "char(1)", unicode: false, fixedLength: true, maxLength: 1, nullable: false, defaultValue: "U")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Peopl__EC7D7D6DF8F28E22", x => x.personID);
                    table.ForeignKey(
                        name: "FK_People_ProfilePic",
                        column: x => x.profilePicID,
                        principalTable: "OH_Pictures",
                        principalColumn: "picID");
                });

            migrationBuilder.CreateTable(
                name: "OH_Activities",
                columns: table => new
                {
                    activityID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    activityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    startDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    capacity = table.Column<int>(type: "int", nullable: false),
                    hostID = table.Column<int>(type: "int", nullable: true),
                    location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PicID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Activ__0FC9CBCCA19CF83A", x => x.activityID);
                    table.ForeignKey(
                        name: "FK_Activities_Host",
                        column: x => x.hostID,
                        principalTable: "OH_People",
                        principalColumn: "personID");
                    table.ForeignKey(
                        name: "FK_Activities_Pic",
                        column: x => x.PicID,
                        principalTable: "OH_Pictures",
                        principalColumn: "picID");
                });

            migrationBuilder.CreateTable(
                name: "OH_PersonBlockedPermissions",
                columns: table => new
                {
                    personID = table.Column<int>(type: "int", nullable: false),
                    permissionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Perso__2B7B1C82105D4EA9", x => new { x.personID, x.permissionName });
                    table.ForeignKey(
                        name: "FK_PersonPermissions_Permission",
                        column: x => x.permissionName,
                        principalTable: "OH_Permissions",
                        principalColumn: "permissionName");
                    table.ForeignKey(
                        name: "FK_PersonPermissions_Person",
                        column: x => x.personID,
                        principalTable: "OH_People",
                        principalColumn: "personID");
                });

            migrationBuilder.CreateTable(
                name: "OH_Residents",
                columns: table => new
                {
                    residentID = table.Column<int>(type: "int", nullable: false),
                    hasLoggedIn = table.Column<bool>(type: "bit", nullable: false),
                    isActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    branchName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    isBokerTov = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    canInitActivity = table.Column<bool>(type: "bit", nullable: false),
                    spouseID = table.Column<int>(type: "int", nullable: false),
                    dateOfArrival = table.Column<DateOnly>(type: "date", nullable: false),
                    homePlace = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phoneNumber = table.Column<string>(type: "char(10)", unicode: false, fixedLength: true, maxLength: 10, nullable: true),
                    profession = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    residentDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    additionalPic1ID = table.Column<int>(type: "int", nullable: true),
                    additionalPic2ID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Resid__9AD71856DD7E720C", x => x.residentID);
                    table.ForeignKey(
                        name: "FK_Residents_AdditionalPic1",
                        column: x => x.additionalPic1ID,
                        principalTable: "OH_Pictures",
                        principalColumn: "picID");
                    table.ForeignKey(
                        name: "FK_Residents_AdditionalPic2",
                        column: x => x.additionalPic2ID,
                        principalTable: "OH_Pictures",
                        principalColumn: "picID");
                    table.ForeignKey(
                        name: "FK_Residents_People",
                        column: x => x.residentID,
                        principalTable: "OH_People",
                        principalColumn: "personID");
                    table.ForeignKey(
                        name: "FK_Residents_Spouse",
                        column: x => x.spouseID,
                        principalTable: "OH_Residents",
                        principalColumn: "residentID");
                });

            migrationBuilder.CreateTable(
                name: "OH_Classes",
                columns: table => new
                {
                    classID = table.Column<int>(type: "int", nullable: false),
                    isRecurring = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    recurrenceLevel = table.Column<int>(type: "int", nullable: false),
                    recurrenceDetails = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    sessionAmount = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Class__7577345E11E38252", x => x.classID);
                    table.ForeignKey(
                        name: "FK_Classes_Activities",
                        column: x => x.classID,
                        principalTable: "OH_Activities",
                        principalColumn: "activityID");
                });

            migrationBuilder.CreateTable(
                name: "OH_Participation",
                columns: table => new
                {
                    activityID = table.Column<int>(type: "int", nullable: false),
                    participantID = table.Column<int>(type: "int", nullable: false),
                    participationDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Parti__172E5FA018314B66", x => new { x.activityID, x.participantID, x.participationDate });
                    table.ForeignKey(
                        name: "FK_Participation_Activity",
                        column: x => x.activityID,
                        principalTable: "OH_Activities",
                        principalColumn: "activityID");
                    table.ForeignKey(
                        name: "FK_Participation_Participant",
                        column: x => x.participantID,
                        principalTable: "OH_People",
                        principalColumn: "personID");
                });

            migrationBuilder.CreateTable(
                name: "OH_Notices",
                columns: table => new
                {
                    noticeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    senderID = table.Column<int>(type: "int", nullable: true),
                    creationDate = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "(getdate())"),
                    noticeTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    noticeMessage = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    noticeCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    noticeSubCategory = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OH_Notic__4ED12E4ED40ADBB5", x => x.noticeID);
                    table.ForeignKey(
                        name: "FK_Notices_Category",
                        column: x => x.noticeCategory,
                        principalTable: "OH_Categories",
                        principalColumn: "CategoryName");
                    table.ForeignKey(
                        name: "FK_Notices_Sender",
                        column: x => x.senderID,
                        principalTable: "OH_Residents",
                        principalColumn: "residentID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OH_Activities_hostID",
                table: "OH_Activities",
                column: "hostID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Activities_PicID",
                table: "OH_Activities",
                column: "PicID");

            migrationBuilder.CreateIndex(
                name: "UQ__OH_Activ__BD8CC0A9662B06D5",
                table: "OH_Activities",
                column: "activityName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OH_Notices_noticeCategory",
                table: "OH_Notices",
                column: "noticeCategory");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Notices_senderID",
                table: "OH_Notices",
                column: "senderID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Participation_participantID",
                table: "OH_Participation",
                column: "participantID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_People_profilePicID",
                table: "OH_People",
                column: "profilePicID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_PersonBlockedPermissions_permissionName",
                table: "OH_PersonBlockedPermissions",
                column: "permissionName");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Residents_additionalPic1ID",
                table: "OH_Residents",
                column: "additionalPic1ID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Residents_additionalPic2ID",
                table: "OH_Residents",
                column: "additionalPic2ID");

            migrationBuilder.CreateIndex(
                name: "IX_OH_Residents_spouseID",
                table: "OH_Residents",
                column: "spouseID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OH_Classes");

            migrationBuilder.DropTable(
                name: "OH_Notices");

            migrationBuilder.DropTable(
                name: "OH_Participation");

            migrationBuilder.DropTable(
                name: "OH_PersonBlockedPermissions");

            migrationBuilder.DropTable(
                name: "OH_Rooms");

            migrationBuilder.DropTable(
                name: "OH_Categories");

            migrationBuilder.DropTable(
                name: "OH_Residents");

            migrationBuilder.DropTable(
                name: "OH_Activities");

            migrationBuilder.DropTable(
                name: "OH_Permissions");

            migrationBuilder.DropTable(
                name: "OH_People");

            migrationBuilder.DropTable(
                name: "OH_Pictures");
        }
    }
}

using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using MigdalorServer.Models;

namespace MigdalorServer.Database
{
    public partial class MigdalorDBContext : DbContext
    {

        public MigdalorDBContext(DbContextOptions<MigdalorDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<OhActivity> OhActivities { get; set; } = null!;
        public virtual DbSet<OhCategory> OhCategories { get; set; } = null!;
        public virtual DbSet<OhClass> OhClasses { get; set; } = null!;
        public virtual DbSet<OhDailyAttendance> OhDailyAttendances { get; set; } = null!;
        public virtual DbSet<OhInterest> OhInterests { get; set; } = null!;
        public virtual DbSet<OhListing> OhListings { get; set; } = null!;
        public virtual DbSet<OhNotice> OhNotices { get; set; } = null!;
        public virtual DbSet<OhOpeningHour> OhOpeningHours { get; set; } = null!;
        public virtual DbSet<OhParticipation> OhParticipations { get; set; } = null!;
        public virtual DbSet<OhPermission> OhPermissions { get; set; } = null!;
        public virtual DbSet<OhPerson> OhPeople { get; set; } = null!;
        public virtual DbSet<OhPicture> OhPictures { get; set; } = null!;
        public virtual DbSet<OhPrivacySetting> OhPrivacySettings { get; set; } = null!;
        public virtual DbSet<OhResident> OhResidents { get; set; } = null!;
        public virtual DbSet<OhRoom> OhRooms { get; set; } = null!;
        public virtual DbSet<OhScheduleOverride> OhScheduleOverrides { get; set; } = null!;
        public virtual DbSet<OhService> OhServices { get; set; } = null!;
        public virtual DbSet<OhUserSetting> OhUserSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<OhActivity>(entity =>
            {
                entity.HasKey(e => e.ActivityId)
                    .HasName("PK__OH_Activ__0FC9CBCCD5C341C4");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.OhActivities)
                    .HasForeignKey(d => d.HostId)
                    .HasConstraintName("FK_Activities_Host");

                entity.HasOne(d => d.Pic)
                    .WithMany(p => p.OhActivities)
                    .HasForeignKey(d => d.PicId)
                    .HasConstraintName("FK_Activities_Pic");
            });

            modelBuilder.Entity<OhCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryHebName)
                    .HasName("PK__OH_Categ__8517B2E13E0D2B85");

                entity.Property(e => e.CategoryColor).HasDefaultValueSql("('#FFFFFF')");
            });

            modelBuilder.Entity<OhClass>(entity =>
            {
                entity.HasKey(e => e.ClassId)
                    .HasName("PK__OH_Class__7577345EE5751577");

                entity.Property(e => e.ClassId).ValueGeneratedNever();

                entity.Property(e => e.IsRecurring).HasDefaultValueSql("((0))");

                entity.HasOne(d => d.Class)
                    .WithOne(p => p.OhClass)
                    .HasForeignKey<OhClass>(d => d.ClassId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Classes_Activities");
            });

            modelBuilder.Entity<OhDailyAttendance>(entity =>
            {
                entity.HasOne(d => d.Resident)
                    .WithMany(p => p.OhDailyAttendances)
                    .HasForeignKey(d => d.ResidentId)
                    .HasConstraintName("FK_OH_DailyAttendance_OH_Residents");
            });

            modelBuilder.Entity<OhInterest>(entity =>
            {
                entity.HasKey(e => e.InterestName)
                    .HasName("PK__OH_Inter__F70EB38A53F5F22F");
            });

            modelBuilder.Entity<OhListing>(entity =>
            {
                entity.Property(e => e.Date).HasDefaultValueSql("(getdate())");

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.Seller)
                    .WithMany(p => p.OhListings)
                    .HasForeignKey(d => d.SellerId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_OH_Listings_Seller");
            });

            modelBuilder.Entity<OhNotice>(entity =>
            {
                entity.HasKey(e => e.NoticeId)
                    .HasName("PK__OH_Notic__4ED12E4E7A8618DF");

                entity.Property(e => e.CreationDate).HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.NoticeCategoryNavigation)
                    .WithMany(p => p.OhNotices)
                    .HasForeignKey(d => d.NoticeCategory)
                    .HasConstraintName("FK_Notices_Category");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.OhNotices)
                    .HasForeignKey(d => d.SenderId)
                    .HasConstraintName("FK_Notices_Sender");
            });

            modelBuilder.Entity<OhOpeningHour>(entity =>
            {
                entity.HasKey(e => e.HourId)
                    .HasName("PK__OH_Openi__18DFA33E19AE9D5C");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.OhOpeningHours)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Hours_Service");
            });

            modelBuilder.Entity<OhParticipation>(entity =>
            {
                entity.HasKey(e => new { e.ActivityId, e.ParticipantId, e.SessionDate })
                    .HasName("PK__OH_Parti__37559D1561FDA4F1");

                entity.Property(e => e.ParticipationStatus).HasDefaultValueSql("('Registered')");

                entity.Property(e => e.RegistrationDate).HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Activity)
                    .WithMany(p => p.OhParticipations)
                    .HasForeignKey(d => d.ActivityId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Participation_Activity");

                entity.HasOne(d => d.Participant)
                    .WithMany(p => p.OhParticipations)
                    .HasForeignKey(d => d.ParticipantId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Participation_Person");
            });

            modelBuilder.Entity<OhPermission>(entity =>
            {
                entity.HasKey(e => e.PermissionName)
                    .HasName("PK__OH_Permi__70661EFD0FB17EC0");
            });

            modelBuilder.Entity<OhPerson>(entity =>
            {
                entity.HasKey(e => e.PersonId)
                    .HasName("PK__OH_Peopl__EC7D7D6DB71CF9F4");

                entity.Property(e => e.PersonId).HasDefaultValueSql("(newid())");

                entity.Property(e => e.Gender).IsFixedLength();

                entity.HasOne(d => d.ProfilePic)
                    .WithMany(p => p.OhPeople)
                    .HasForeignKey(d => d.ProfilePicId)
                    .HasConstraintName("FK_People_ProfilePic");

                entity.HasMany(d => d.PermissionNames)
                    .WithMany(p => p.People)
                    .UsingEntity<Dictionary<string, object>>(
                        "OhPersonBlockedPermission",
                        l => l.HasOne<OhPermission>().WithMany().HasForeignKey("PermissionName").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_PersonPermissions_Permission"),
                        r => r.HasOne<OhPerson>().WithMany().HasForeignKey("PersonId").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_PersonPermissions_Person"),
                        j =>
                        {
                            j.HasKey("PersonId", "PermissionName").HasName("PK__OH_Perso__2B7B1C825C7E3668");

                            j.ToTable("OH_PersonBlockedPermissions");

                            j.IndexerProperty<Guid>("PersonId").HasColumnName("personID");

                            j.IndexerProperty<string>("PermissionName").HasMaxLength(100).HasColumnName("permissionName");
                        });
            });

            modelBuilder.Entity<OhPicture>(entity =>
            {
                entity.HasKey(e => e.PicId)
                    .HasName("PK__OH_Pictu__06707FCD5CA26DEA");

                entity.Property(e => e.DateTime).HasDefaultValueSql("(getdate())");

                entity.Property(e => e.PicRole).HasDefaultValueSql("('unassigned')");

                entity.HasOne(d => d.Listing)
                    .WithMany(p => p.OhPictures)
                    .HasForeignKey(d => d.ListingId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_OH_Pictures_OH_Listings");

                entity.HasOne(d => d.Uploader)
                    .WithMany(p => p.OhPictures)
                    .HasForeignKey(d => d.UploaderId)
                    .HasConstraintName("FK_Pictures_Uploader");
            });

            modelBuilder.Entity<OhPrivacySetting>(entity =>
            {
                entity.HasKey(e => e.PersonId)
                    .HasName("PK__OH_Priva__AA2FFB85842960B8");

                entity.Property(e => e.PersonId).ValueGeneratedNever();

                entity.Property(e => e.ShowAboutMe).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowAdditionalPictures).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowApartmentNumber).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowArrivalYear).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowEmail).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowInterests).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowMobilePhone).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowOrigin).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowPartner).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowProfession).HasDefaultValueSql("((1))");

                entity.Property(e => e.ShowProfilePicture).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.Person)
                    .WithOne(p => p.OhPrivacySetting)
                    .HasForeignKey<OhPrivacySetting>(d => d.PersonId)
                    .HasConstraintName("FK_PrivacySettings_People");
            });

            modelBuilder.Entity<OhResident>(entity =>
            {
                entity.HasKey(e => e.ResidentId)
                    .HasName("PK__OH_Resid__9AD7185616AE2A4A");

                entity.Property(e => e.ResidentId).ValueGeneratedNever();

                entity.Property(e => e.DateOfArrival).HasDefaultValueSql("(getdate())");

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.Property(e => e.IsBokerTov).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.AdditionalPic1)
                    .WithMany(p => p.OhResidentAdditionalPic1s)
                    .HasForeignKey(d => d.AdditionalPic1Id)
                    .HasConstraintName("FK_Residents_AdditionalPic1");

                entity.HasOne(d => d.AdditionalPic2)
                    .WithMany(p => p.OhResidentAdditionalPic2s)
                    .HasForeignKey(d => d.AdditionalPic2Id)
                    .HasConstraintName("FK_Residents_AdditionalPic2");

                entity.HasOne(d => d.Resident)
                    .WithOne(p => p.OhResident)
                    .HasForeignKey<OhResident>(d => d.ResidentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Residents_People");

                entity.HasOne(d => d.Spouse)
                    .WithMany(p => p.InverseSpouse)
                    .HasForeignKey(d => d.SpouseId)
                    .HasConstraintName("FK_Residents_Spouse");

                entity.HasMany(d => d.InterestNames)
                    .WithMany(p => p.Residents)
                    .UsingEntity<Dictionary<string, object>>(
                        "OhResidentsInterest",
                        l => l.HasOne<OhInterest>().WithMany().HasForeignKey("InterestName").HasConstraintName("FK_ResidentsInterests_Interests"),
                        r => r.HasOne<OhResident>().WithMany().HasForeignKey("ResidentId").HasConstraintName("FK_ResidentsInterests_Residents"),
                        j =>
                        {
                            j.HasKey("ResidentId", "InterestName");

                            j.ToTable("OH_ResidentsInterests");

                            j.IndexerProperty<Guid>("ResidentId").HasColumnName("residentID");

                            j.IndexerProperty<string>("InterestName").HasMaxLength(50).HasColumnName("interestName");
                        });
            });

            modelBuilder.Entity<OhRoom>(entity =>
            {
                entity.HasKey(e => new { e.RoomNumber, e.BuildingNumber })
                    .HasName("PK__OH_Rooms__CD87FECFF4277B52");
            });

            modelBuilder.Entity<OhScheduleOverride>(entity =>
            {
                entity.HasKey(e => e.OverrideId)
                    .HasName("PK__OH_Sched__37B513C43B88609F");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.OhScheduleOverrides)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Overrides_Service");
            });

            modelBuilder.Entity<OhService>(entity =>
            {
                entity.HasKey(e => e.ServiceId)
                    .HasName("PK__OH_Servi__C51BB0EAD92A1A44");

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.Picture)
                    .WithMany(p => p.OhServices)
                    .HasForeignKey(d => d.PictureId)
                    .HasConstraintName("FK_Service_Picture");
            });

            modelBuilder.Entity<OhUserSetting>(entity =>
            {
                entity.HasKey(e => e.UserId)
                    .HasName("PK_OH_UserSettings_UserID");

                entity.Property(e => e.UserId).ValueGeneratedNever();

                entity.Property(e => e.UserSelectedDirection)
                    .HasDefaultValueSql("('rtl')")
                    .IsFixedLength();

                entity.Property(e => e.UserSelectedFontSize).HasDefaultValueSql("((1))");

                entity.Property(e => e.UserSelectedLanguage).HasDefaultValueSql("('he')");

                entity.HasOne(d => d.User)
                    .WithOne(p => p.OhUserSetting)
                    .HasForeignKey<OhUserSetting>(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_OH_UserSettings_UserID_People");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

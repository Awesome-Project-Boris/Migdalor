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
        public virtual DbSet<OhApartment> OhApartments { get; set; } = null!;
        public virtual DbSet<OhBokerTov> OhBokerTovs { get; set; } = null!;
        public virtual DbSet<OhBuilding> OhBuildings { get; set; } = null!;
        public virtual DbSet<OhCategory> OhCategories { get; set; } = null!;
        public virtual DbSet<OhEvent> OhEvents { get; set; } = null!;
        public virtual DbSet<OhEventInstance> OhEventInstances { get; set; } = null!;
        public virtual DbSet<OhEventRegistration> OhEventRegistrations { get; set; } = null!;
        public virtual DbSet<OhInfoSheet> OhInfoSheets { get; set; } = null!;
        public virtual DbSet<OhInterest> OhInterests { get; set; } = null!;
        public virtual DbSet<OhListing> OhListings { get; set; } = null!;
        public virtual DbSet<OhMapNode> OhMapNodes { get; set; } = null!;
        public virtual DbSet<OhNotice> OhNotices { get; set; } = null!;
        public virtual DbSet<OhOpeningHour> OhOpeningHours { get; set; } = null!;
        public virtual DbSet<OhParticipation> OhParticipations { get; set; } = null!;
        public virtual DbSet<OhPermission> OhPermissions { get; set; } = null!;
        public virtual DbSet<OhPerson> OhPeople { get; set; } = null!;
        public virtual DbSet<OhPicture> OhPictures { get; set; } = null!;
        public virtual DbSet<OhPrivacySetting> OhPrivacySettings { get; set; } = null!;
        public virtual DbSet<OhResident> OhResidents { get; set; } = null!;
        public virtual DbSet<OhResidentCategorySubscription> OhResidentCategorySubscriptions { get; set; } = null!;
        public virtual DbSet<OhScheduleOverride> OhScheduleOverrides { get; set; } = null!;
        public virtual DbSet<OhService> OhServices { get; set; } = null!;
        public virtual DbSet<OhTimeTableAddition> OhTimeTableAdditions { get; set; } = null!;
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

            modelBuilder.Entity<OhApartment>(entity =>
            {
                entity.HasKey(e => e.ApartmentNumber)
                    .HasName("PK__OH_Apart__C75B2DDF7A60EFC6");

                entity.Property(e => e.ApartmentNumber).ValueGeneratedNever();

                entity.HasOne(d => d.AccessBuilding)
                    .WithMany(p => p.OhApartmentAccessBuildings)
                    .HasForeignKey(d => d.AccessBuildingId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Apartments_AccessBuilding");

                entity.HasOne(d => d.PhysicalBuilding)
                    .WithMany(p => p.OhApartmentPhysicalBuildings)
                    .HasForeignKey(d => d.PhysicalBuildingId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Apartments_PhysicalBuilding");
            });

            modelBuilder.Entity<OhBokerTov>(entity =>
            {
                entity.HasOne(d => d.Resident)
                    .WithMany(p => p.OhBokerTovs)
                    .HasForeignKey(d => d.ResidentId)
                    .HasConstraintName("FK_OH_DailyAttendance_OH_Residents");
            });

            modelBuilder.Entity<OhBuilding>(entity =>
            {
                entity.HasKey(e => e.BuildingId)
                    .HasName("PK__OH_Build__5463CDE4F2DE6EB5");

                entity.Property(e => e.BuildingId).ValueGeneratedNever();

                entity.HasMany(d => d.Nodes)
                    .WithMany(p => p.Buildings)
                    .UsingEntity<Dictionary<string, object>>(
                        "OhBuildingEntrance",
                        l => l.HasOne<OhMapNode>().WithMany().HasForeignKey("NodeId").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_BuildingEntrances_MapNodes"),
                        r => r.HasOne<OhBuilding>().WithMany().HasForeignKey("BuildingId").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_BuildingEntrances_Buildings"),
                        j =>
                        {
                            j.HasKey("BuildingId", "NodeId").HasName("PK_BuildingEntrances");

                            j.ToTable("OH_BuildingEntrances");

                            j.IndexerProperty<Guid>("BuildingId").HasColumnName("BuildingID");

                            j.IndexerProperty<int>("NodeId").HasColumnName("NodeID");
                        });
            });

            modelBuilder.Entity<OhCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryHebName)
                    .HasName("PK__OH_Categ__8517B2E13E0D2B85");

                entity.Property(e => e.CategoryColor).HasDefaultValueSql("('#FFFFFF')");
            });

            modelBuilder.Entity<OhEvent>(entity =>
            {
                entity.HasKey(e => e.EventId)
                    .HasName("PK__Events__7944C87002AC49E8");

                entity.Property(e => e.DateCreated).HasDefaultValueSql("(getutcdate())");
            });

            modelBuilder.Entity<OhEventInstance>(entity =>
            {
                entity.HasKey(e => e.InstanceId)
                    .HasName("PK__OH_Event__5C51996F1ECEB6DC");

                entity.Property(e => e.Status).HasDefaultValueSql("('Scheduled')");

                entity.HasOne(d => d.Event)
                    .WithMany(p => p.OhEventInstances)
                    .HasForeignKey(d => d.EventId)
                    .HasConstraintName("FK_EventInstances_Events");
            });

            modelBuilder.Entity<OhEventRegistration>(entity =>
            {
                entity.HasKey(e => e.RegistrationId)
                    .HasName("PK__Event_Re__6EF588300181CCBB");

                entity.Property(e => e.RegistrationDate).HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Status).HasDefaultValueSql("('Active')");

                entity.HasOne(d => d.Event)
                    .WithMany(p => p.OhEventRegistrations)
                    .HasForeignKey(d => d.EventId)
                    .HasConstraintName("FK_EventRegistrations_Events");
            });

            modelBuilder.Entity<OhInfoSheet>(entity =>
            {
                entity.HasKey(e => e.InfoKey)
                    .HasName("PK__OH_InfoS__789A07FE2EB71597");
            });

            modelBuilder.Entity<OhInterest>(entity =>
            {
                entity.HasKey(e => e.InterestName)
                    .HasName("PK__OH_Inter__F70EB38A53F5F22F");
            });

            modelBuilder.Entity<OhListing>(entity =>
            {
                entity.Property(e => e.Date).HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.Seller)
                    .WithMany(p => p.OhListings)
                    .HasForeignKey(d => d.SellerId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_OH_Listings_Seller");
            });

            modelBuilder.Entity<OhMapNode>(entity =>
            {
                entity.HasKey(e => e.NodeId)
                    .HasName("PK__OH_MapNo__6BAE224388824ECF");

                entity.Property(e => e.NodeId).ValueGeneratedNever();
            });

            modelBuilder.Entity<OhNotice>(entity =>
            {
                entity.HasKey(e => e.NoticeId)
                    .HasName("PK__OH_Notic__4ED12E4E7A8618DF");

                entity.Property(e => e.CreationDate).HasDefaultValueSql("(getutcdate())");

                entity.HasOne(d => d.NoticeCategoryNavigation)
                    .WithMany(p => p.OhNotices)
                    .HasForeignKey(d => d.NoticeCategory)
                    .HasConstraintName("FK_Notices_Category");

                entity.HasOne(d => d.Picture)
                    .WithMany(p => p.OhNotices)
                    .HasForeignKey(d => d.PictureId)
                    .HasConstraintName("FK_OH_Notices_OH_Pictures");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.OhNotices)
                    .HasForeignKey(d => d.SenderId)
                    .HasConstraintName("FK_Notices_Sender");
            });

            modelBuilder.Entity<OhOpeningHour>(entity =>
            {
                entity.HasKey(e => e.HourId)
                    .HasName("PK__OH_Openi__18DFA33EB8BA19C2");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.OhOpeningHours)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Hours_Service");
            });

            modelBuilder.Entity<OhParticipation>(entity =>
            {
                entity.HasKey(e => e.ParticipationId)
                    .HasName("PK__OH_Parti__4EA27080DCD56B17");

                entity.Property(e => e.RegistrationTime).HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Status).HasDefaultValueSql("('Registered')");

                entity.HasOne(d => d.Event)
                    .WithMany(p => p.OhParticipations)
                    .HasForeignKey(d => d.EventId)
                    .HasConstraintName("FK_Participation_Events");
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
                    .HasName("PK__OH_Resid__9AD718560888CFE4");

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

                entity.HasOne(d => d.ResidentApartmentNumberNavigation)
                    .WithMany(p => p.OhResidents)
                    .HasForeignKey(d => d.ResidentApartmentNumber)
                    .HasConstraintName("FK_Residents_Apartment");

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

            modelBuilder.Entity<OhResidentCategorySubscription>(entity =>
            {
                entity.HasKey(e => new { e.ResidentId, e.CategoryHebName })
                    .HasName("PK_ResidentCategorySubscriptions");

                entity.Property(e => e.IsSubscribed).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.CategoryHebNameNavigation)
                    .WithMany(p => p.OhResidentCategorySubscriptions)
                    .HasForeignKey(d => d.CategoryHebName)
                    .HasConstraintName("FK_Subscriptions_Categories");

                entity.HasOne(d => d.Resident)
                    .WithMany(p => p.OhResidentCategorySubscriptions)
                    .HasForeignKey(d => d.ResidentId)
                    .HasConstraintName("FK_Subscriptions_Residents");
            });

            modelBuilder.Entity<OhScheduleOverride>(entity =>
            {
                entity.HasKey(e => e.OverrideId)
                    .HasName("PK__OH_Sched__37B513C41ACA4C17");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.OhScheduleOverrides)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Overrides_Service");
            });

            modelBuilder.Entity<OhService>(entity =>
            {
                entity.HasKey(e => e.ServiceId)
                    .HasName("PK__OH_Servi__C51BB0EA7F14E7D3");

                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

                entity.HasOne(d => d.ParentServiceNavigation)
                    .WithMany(p => p.InverseParentServiceNavigation)
                    .HasForeignKey(d => d.ParentService)
                    .HasConstraintName("FK_Service_Parent");

                entity.HasOne(d => d.Picture)
                    .WithMany(p => p.OhServices)
                    .HasForeignKey(d => d.PictureId)
                    .HasConstraintName("FK_Service_Picture");
            });

            modelBuilder.Entity<OhTimeTableAddition>(entity =>
            {
                entity.Property(e => e.DateAdded).HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Id).ValueGeneratedOnAdd();
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

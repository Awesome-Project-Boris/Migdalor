using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Models;

namespace MigdalorServer.Database;

public partial class Igroup187ProdContext : DbContext
{
    public Igroup187ProdContext()
    {
    }

    public Igroup187ProdContext(DbContextOptions<Igroup187ProdContext> options)
        : base(options)
    {
    }

    public virtual DbSet<OhActivity> OhActivities { get; set; }

    public virtual DbSet<OhCategory> OhCategories { get; set; }

    public virtual DbSet<OhClass> OhClasses { get; set; }

    public virtual DbSet<OhNotice> OhNotices { get; set; }

    public virtual DbSet<OhParticipation> OhParticipations { get; set; }

    public virtual DbSet<OhPermission> OhPermissions { get; set; }

    public virtual DbSet<OhPerson> OhPeople { get; set; }

    public virtual DbSet<OhPicture> OhPictures { get; set; }

    public virtual DbSet<OhResident> OhResidents { get; set; }

    public virtual DbSet<OhRoom> OhRooms { get; set; }

    private static string GetDBConnectionString()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        return cStr;
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(GetDBConnectionString());

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OhActivity>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("PK__OH_Activ__0FC9CBCCA19CF83A");

            entity.ToTable("OH_Activities");

            entity.HasIndex(e => e.ActivityName, "UQ__OH_Activ__BD8CC0A9662B06D5").IsUnique();

            entity.Property(e => e.ActivityId).HasColumnName("activityID");
            entity.Property(e => e.ActivityName)
                .HasMaxLength(100)
                .HasColumnName("activityName");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.HostId).HasColumnName("hostID");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.PicId).HasColumnName("PicID");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("startDate");

            entity.HasOne(d => d.Host).WithMany(p => p.OhActivities)
                .HasForeignKey(d => d.HostId)
                .HasConstraintName("FK_Activities_Host");

            entity.HasOne(d => d.Pic).WithMany(p => p.OhActivities)
                .HasForeignKey(d => d.PicId)
                .HasConstraintName("FK_Activities_Pic");
        });

        modelBuilder.Entity<OhCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryName).HasName("PK__OH_Categ__8517B2E13E0D2B85");

            entity.ToTable("OH_Categories");

            entity.Property(e => e.CategoryName).HasMaxLength(100);
        });

        modelBuilder.Entity<OhClass>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__OH_Class__7577345E11E38252");

            entity.ToTable("OH_Classes");

            entity.Property(e => e.ClassId)
                .ValueGeneratedNever()
                .HasColumnName("classID");
            entity.Property(e => e.IsRecurring)
                .HasDefaultValue(false)
                .HasColumnName("isRecurring");
            entity.Property(e => e.RecurrenceDetails)
                .IsUnicode(false)
                .HasColumnName("recurrenceDetails");
            entity.Property(e => e.RecurrenceLevel).HasColumnName("recurrenceLevel");
            entity.Property(e => e.SessionAmount).HasColumnName("sessionAmount");

            entity.HasOne(d => d.Class).WithOne(p => p.OhClass)
                .HasForeignKey<OhClass>(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Classes_Activities");
        });

        modelBuilder.Entity<OhNotice>(entity =>
        {
            entity.HasKey(e => e.NoticeId).HasName("PK__OH_Notic__4ED12E4ED40ADBB5");

            entity.ToTable("OH_Notices");

            entity.Property(e => e.NoticeId).HasColumnName("noticeID");
            entity.Property(e => e.CreationDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("creationDate");
            entity.Property(e => e.NoticeCategory)
                .HasMaxLength(100)
                .HasColumnName("noticeCategory");
            entity.Property(e => e.NoticeMessage)
                .HasMaxLength(300)
                .HasColumnName("noticeMessage");
            entity.Property(e => e.NoticeSubCategory).HasColumnName("noticeSubCategory");
            entity.Property(e => e.NoticeTitle)
                .HasMaxLength(100)
                .HasColumnName("noticeTitle");
            entity.Property(e => e.SenderId).HasColumnName("senderID");

            entity.HasOne(d => d.NoticeCategoryNavigation).WithMany(p => p.OhNotices)
                .HasForeignKey(d => d.NoticeCategory)
                .HasConstraintName("FK_Notices_Category");

            entity.HasOne(d => d.Sender).WithMany(p => p.OhNotices)
                .HasForeignKey(d => d.SenderId)
                .HasConstraintName("FK_Notices_Sender");
        });

        modelBuilder.Entity<OhParticipation>(entity =>
        {
            entity.HasKey(e => new { e.ActivityId, e.ParticipantId, e.ParticipationDate }).HasName("PK__OH_Parti__172E5FA018314B66");

            entity.ToTable("OH_Participation");

            entity.Property(e => e.ActivityId).HasColumnName("activityID");
            entity.Property(e => e.ParticipantId).HasColumnName("participantID");
            entity.Property(e => e.ParticipationDate).HasColumnName("participationDate");

            entity.HasOne(d => d.Activity).WithMany(p => p.OhParticipations)
                .HasForeignKey(d => d.ActivityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Participation_Activity");

            entity.HasOne(d => d.Participant).WithMany(p => p.OhParticipations)
                .HasForeignKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Participation_Participant");
        });

        modelBuilder.Entity<OhPermission>(entity =>
        {
            entity.HasKey(e => e.PermissionName).HasName("PK__OH_Permi__70661EFD0FB17EC0");

            entity.ToTable("OH_Permissions");

            entity.Property(e => e.PermissionName)
                .HasMaxLength(100)
                .HasColumnName("permissionName");
        });

        modelBuilder.Entity<OhPerson>(entity =>
        {
            entity.HasKey(e => e.PersonId).HasName("PK__OH_Peopl__EC7D7D6DF8F28E22");

            entity.ToTable("OH_People");

            entity.Property(e => e.PersonId).HasColumnName("personID");
            entity.Property(e => e.DateOfBirth).HasColumnName("dateOfBirth");
            entity.Property(e => e.Email)
                .HasMaxLength(2048)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.EngFirstName)
                .HasMaxLength(100)
                .HasColumnName("engFirstName");
            entity.Property(e => e.EngLastName)
                .HasMaxLength(100)
                .HasColumnName("engLastName");
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValue("U")
                .IsFixedLength()
                .HasColumnName("gender");
            entity.Property(e => e.HebFirstName)
                .HasMaxLength(100)
                .HasColumnName("hebFirstName");
            entity.Property(e => e.HebLastName)
                .HasMaxLength(100)
                .HasColumnName("hebLastName");
            entity.Property(e => e.ProfilePicId).HasColumnName("profilePicID");

            entity.HasOne(d => d.ProfilePic).WithMany(p => p.OhPeople)
                .HasForeignKey(d => d.ProfilePicId)
                .HasConstraintName("FK_People_ProfilePic");

            entity.HasMany(d => d.PermissionNames).WithMany(p => p.People)
                .UsingEntity<Dictionary<string, object>>(
                    "OhPersonBlockedPermission",
                    r => r.HasOne<OhPermission>().WithMany()
                        .HasForeignKey("PermissionName")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_PersonPermissions_Permission"),
                    l => l.HasOne<OhPerson>().WithMany()
                        .HasForeignKey("PersonId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_PersonPermissions_Person"),
                    j =>
                    {
                        j.HasKey("PersonId", "PermissionName").HasName("PK__OH_Perso__2B7B1C82105D4EA9");
                        j.ToTable("OH_PersonBlockedPermissions");
                        j.IndexerProperty<int>("PersonId").HasColumnName("personID");
                        j.IndexerProperty<string>("PermissionName")
                            .HasMaxLength(100)
                            .HasColumnName("permissionName");
                    });
        });

        modelBuilder.Entity<OhPicture>(entity =>
        {
            entity.HasKey(e => e.PicId).HasName("PK__OH_Pictu__06707FCD5CA26DEA");

            entity.ToTable("OH_Pictures");

            entity.Property(e => e.PicId).HasColumnName("picID");
            entity.Property(e => e.PicAlt)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("picAlt");
            entity.Property(e => e.PicName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("picName");
            entity.Property(e => e.PicPath)
                .IsUnicode(false)
                .HasColumnName("picPath");
        });

        modelBuilder.Entity<OhResident>(entity =>
        {
            entity.HasKey(e => e.ResidentId).HasName("PK__OH_Resid__9AD71856DD7E720C");

            entity.ToTable("OH_Residents");

            entity.Property(e => e.ResidentId)
                .ValueGeneratedNever()
                .HasColumnName("residentID");
            entity.Property(e => e.AdditionalPic1Id).HasColumnName("additionalPic1ID");
            entity.Property(e => e.AdditionalPic2Id).HasColumnName("additionalPic2ID");
            entity.Property(e => e.BranchName)
                .HasMaxLength(100)
                .HasColumnName("branchName");
            entity.Property(e => e.CanInitActivity).HasColumnName("canInitActivity");
            entity.Property(e => e.DateOfArrival).HasColumnName("dateOfArrival");
            entity.Property(e => e.HasLoggedIn).HasColumnName("hasLoggedIn");
            entity.Property(e => e.HomePlace)
                .HasMaxLength(100)
                .HasColumnName("homePlace");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsBokerTov)
                .HasDefaultValue(true)
                .HasColumnName("isBokerTov");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("phoneNumber");
            entity.Property(e => e.Profession)
                .HasMaxLength(100)
                .HasColumnName("profession");
            entity.Property(e => e.ResidentDescription).HasColumnName("residentDescription");
            entity.Property(e => e.SpouseId).HasColumnName("spouseID");

            entity.HasOne(d => d.AdditionalPic1).WithMany(p => p.OhResidentAdditionalPic1s)
                .HasForeignKey(d => d.AdditionalPic1Id)
                .HasConstraintName("FK_Residents_AdditionalPic1");

            entity.HasOne(d => d.AdditionalPic2).WithMany(p => p.OhResidentAdditionalPic2s)
                .HasForeignKey(d => d.AdditionalPic2Id)
                .HasConstraintName("FK_Residents_AdditionalPic2");

            entity.HasOne(d => d.Resident).WithOne(p => p.OhResident)
                .HasForeignKey<OhResident>(d => d.ResidentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Residents_People");

            entity.HasOne(d => d.Spouse).WithMany(p => p.InverseSpouse)
                .HasForeignKey(d => d.SpouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Residents_Spouse");
        });

        modelBuilder.Entity<OhRoom>(entity =>
        {
            entity.HasKey(e => new { e.RoomNumber, e.BuildingNumber }).HasName("PK__OH_Rooms__CD87FECFF4277B52");

            entity.ToTable("OH_Rooms");

            entity.Property(e => e.RoomNumber).HasColumnName("roomNumber");
            entity.Property(e => e.BuildingNumber).HasColumnName("buildingNumber");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.RoomName)
                .HasMaxLength(100)
                .HasColumnName("roomName");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

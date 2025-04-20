using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Models;

namespace MigdalorServer.Database;

public partial class MigdalorDBContext : DbContext
{
    public MigdalorDBContext(DbContextOptions<MigdalorDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<OhActivity> OhActivities { get; set; }

    public virtual DbSet<OhCategory> OhCategories { get; set; }

    public virtual DbSet<OhClass> OhClasses { get; set; }

    public virtual DbSet<OhListing> OhListings { get; set; }

    public virtual DbSet<OhNotice> OhNotices { get; set; }

    public virtual DbSet<OhParticipation> OhParticipations { get; set; }

    public virtual DbSet<OhPermission> OhPermissions { get; set; }

    public virtual DbSet<OhPerson> OhPeople { get; set; }

    public virtual DbSet<OhPicture> OhPictures { get; set; }

    public virtual DbSet<OhResident> OhResidents { get; set; }

    public virtual DbSet<OhRoom> OhRooms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OhActivity>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("PK__OH_Activ__0FC9CBCCD5C341C4");

            entity.HasOne(d => d.Host).WithMany(p => p.OhActivities).HasConstraintName("FK_Activities_Host");

            entity.HasOne(d => d.Pic).WithMany(p => p.OhActivities).HasConstraintName("FK_Activities_Pic");
        });

        modelBuilder.Entity<OhCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryHebName).HasName("PK__OH_Categ__8517B2E13E0D2B85");

            entity.Property(e => e.CategoryColor).HasDefaultValue("#FFFFFF");
        });

        modelBuilder.Entity<OhClass>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__OH_Class__7577345EE5751577");

            entity.Property(e => e.ClassId).ValueGeneratedNever();
            entity.Property(e => e.IsRecurring).HasDefaultValue(false);

            entity.HasOne(d => d.Class).WithOne(p => p.OhClass)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Classes_Activities");
        });

        modelBuilder.Entity<OhListing>(entity =>
        {
            entity.Property(e => e.Date).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Seller).WithMany(p => p.OhListings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OH_Listings_Seller");
        });

        modelBuilder.Entity<OhNotice>(entity =>
        {
            entity.HasKey(e => e.NoticeId).HasName("PK__OH_Notic__4ED12E4E7A8618DF");

            entity.Property(e => e.CreationDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.NoticeCategoryNavigation).WithMany(p => p.OhNotices).HasConstraintName("FK_Notices_Category");

            entity.HasOne(d => d.Sender).WithMany(p => p.OhNotices).HasConstraintName("FK_Notices_Sender");
        });

        modelBuilder.Entity<OhParticipation>(entity =>
        {
            entity.HasKey(e => new { e.ActivityId, e.ParticipantId, e.ParticipationDate }).HasName("PK__OH_Parti__172E5FA03E34F7FF");

            entity.HasOne(d => d.Activity).WithMany(p => p.OhParticipations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Participation_Activity");

            entity.HasOne(d => d.Participant).WithMany(p => p.OhParticipations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Participation_Participant");
        });

        modelBuilder.Entity<OhPermission>(entity =>
        {
            entity.HasKey(e => e.PermissionName).HasName("PK__OH_Permi__70661EFD0FB17EC0");
        });

        modelBuilder.Entity<OhPerson>(entity =>
        {
            entity.HasKey(e => e.PersonId).HasName("PK__OH_Peopl__EC7D7D6DB71CF9F4");

            entity.Property(e => e.PersonId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Gender).IsFixedLength();

            entity.HasOne(d => d.ProfilePic).WithMany(p => p.OhPeople).HasConstraintName("FK_People_ProfilePic");

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
                        j.HasKey("PersonId", "PermissionName").HasName("PK__OH_Perso__2B7B1C825C7E3668");
                        j.ToTable("OH_PersonBlockedPermissions");
                        j.IndexerProperty<Guid>("PersonId").HasColumnName("personID");
                        j.IndexerProperty<string>("PermissionName")
                            .HasMaxLength(100)
                            .HasColumnName("permissionName");
                    });
        });

        modelBuilder.Entity<OhPicture>(entity =>
        {
            entity.HasKey(e => e.PicId).HasName("PK__OH_Pictu__06707FCD5CA26DEA");

            entity.Property(e => e.DateTime).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PicRole).HasDefaultValue("unassigned");

            entity.HasOne(d => d.Listing).WithMany(p => p.OhPictures)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_OH_Pictures_OH_Listings");

            entity.HasOne(d => d.Uploader).WithMany(p => p.OhPictures).HasConstraintName("FK_Pictures_Uploader");
        });

        modelBuilder.Entity<OhResident>(entity =>
        {
            entity.HasKey(e => e.ResidentId).HasName("PK__OH_Resid__9AD7185616AE2A4A");

            entity.Property(e => e.ResidentId).ValueGeneratedNever();
            entity.Property(e => e.DateOfArrival).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsBokerTov).HasDefaultValue(true);

            entity.HasOne(d => d.AdditionalPic1).WithMany(p => p.OhResidentAdditionalPic1s).HasConstraintName("FK_Residents_AdditionalPic1");

            entity.HasOne(d => d.AdditionalPic2).WithMany(p => p.OhResidentAdditionalPic2s).HasConstraintName("FK_Residents_AdditionalPic2");

            entity.HasOne(d => d.Resident).WithOne(p => p.OhResident)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Residents_People");

            entity.HasOne(d => d.Spouse).WithMany(p => p.InverseSpouse).HasConstraintName("FK_Residents_Spouse");
        });

        modelBuilder.Entity<OhRoom>(entity =>
        {
            entity.HasKey(e => new { e.RoomNumber, e.BuildingNumber }).HasName("PK__OH_Rooms__CD87FECFF4277B52");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

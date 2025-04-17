using System;

namespace MigdalorServer.Models.DTOs;

public class NewNotice
{
    public string Title { get; set; }

    public string Content { get; set; }

    public Guid SenderId { get; set; }

    public string Category { get; set; }

    public string? SubCategory { get; set; } = null;
}

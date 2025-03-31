using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhParticipation
{
    [Required]
    public int ActivityId { get; set; }
    public virtual OhActivity Activity { get; set; } = null!;

    [Required]
    public int ParticipantId { get; set; }
    public virtual OhPerson Participant { get; set; } = null!;

    [Required]
    public DateOnly ParticipationDate { get; set; }

}

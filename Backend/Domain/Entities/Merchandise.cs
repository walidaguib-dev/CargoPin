using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class Merchandise
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!; // "Steel Coils"
        public CargoType CargoType { get; set; }
        public decimal? Weight { get; set; }
        public int? NumberOfHeat { get; set; } // specific to steel coils
        public string? Note { get; set; }
    }
}

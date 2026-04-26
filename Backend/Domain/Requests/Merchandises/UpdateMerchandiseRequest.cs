using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Requests.Merchandises
{
    public class UpdateMerchandiseRequest
    {
        public string Description { get; set; } = null!;
        public string CargoType { get; set; } = null!;
        public decimal? Weight { get; set; }
        public int? NumberOfHeat { get; set; }
        public string? Note { get; set; }
    }
}

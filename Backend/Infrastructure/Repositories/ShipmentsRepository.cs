using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Requests.Shipments;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ShipmentsRepository(ApplicationDbContext context, ICaching cachingService)
        : IShipments
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Shipment> CreateAsync(Shipment shipment)
        {
            var result = await _context.Shipments.AddAsync(shipment);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int Id)
        {
            var result = await _context.Shipments.Where(x => x.Id == Id).ExecuteDeleteAsync();
            return result is 0 ? null : true;
        }

        public async Task<Shipment?> GetShipmentAsync(int Id)
        {
            var key = $"shipment_{Id}";
            return await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .Shipments.Include(x => x.Client)
                        .Include(x => x.Vessel)
                        .Include(x => x.Merchandise)
                        .FirstOrDefaultAsync(x => x.Id == Id, token);
                },
                TimeSpan.FromMinutes(10),
                ["shipment"]
            );
        }

        public async Task<IQueryable<Shipment>> GetShipmentsAsync()
        {
            var key = "shipments";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .Shipments.Include(x => x.Client)
                        .Include(x => x.Vessel)
                        .Include(x => x.Merchandise)
                        .ToListAsync(token);
                },
                TimeSpan.FromMinutes(10),
                ["shipments"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateShipmentRequest request)
        {
            var shipment = await _context.Shipments.FindAsync(Id);
            if (shipment == null)
                return null;

            shipment.BLNumbers = request.BLNumbers;
            shipment.ArrivalDate = request.ArrivalDate;
            shipment.Note = request.Note;
            shipment.ClientId = request.ClientId;
            shipment.VesselId = request.VesselId;
            shipment.MerchandiseId = request.MerchandiseId;
            shipment.Status = Enum.TryParse<ShipmentStatus>(request.Status, true, out var status)
                ? status
                : ShipmentStatus.Awaiting;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}

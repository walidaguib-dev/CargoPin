using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class FileUploadsRepository(
        Cloudinary cloudinaryService,
        ApplicationDbContext context,
        ICaching cachingService
    ) : IFileUploads
    {
        private readonly Cloudinary _cloudinaryService = cloudinaryService;
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<bool?> DeleteUploadAsync(string publicId)
        {
            var file = await _context.FileUploads.FirstOrDefaultAsync(u => u.PublicId == publicId);
            var deletionParams = new DeletionParams(file?.PublicId);
            var result = await _cloudinaryService.DestroyAsync(deletionParams);
            if (result.Error != null || result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return false;
            }
            _context.FileUploads.Remove(file!);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IQueryable<FileUploads>> GetAllFilesByUserAsync(string userId)
        {
            var key = $"user_uploads_{userId}";
            var files = await _cachingService.GetOrSetAsync(
                $"files:user:{userId}",
                async ct =>
                    await _context
                        .FileUploads.AsNoTracking()
                        .Include(x => x.User)
                        .Where(x => x.UserId == userId)
                        .ToListAsync(ct),
                TimeSpan.FromMinutes(10),
                tags: [$"user_uploads"]
            );

            return (files ?? []).AsQueryable();
        }

        public async Task<FileUploads?> GetUploadByUserAsync(string userId)
        {
            var key = $"user_upload_{userId}";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .FileUploads.AsNoTracking()
                        .Include(x => x.User)
                        .Where(x => x.UserId == userId)
                        .FirstAsync();
                },
                TimeSpan.FromMinutes(10),
                ["user_upload"]
            );
            return result!;
        }

        public async Task<bool?> UpdateAsync(string userId, IFormFile newfile, string oldPublicId)
        {
            // Step 1: Delete old file
            var file =
                await _context.FileUploads.FirstOrDefaultAsync(u => u.PublicId == oldPublicId)
                ?? throw new Exception("file not found!");
            var deletionParams = new DeletionParams(file.PublicId);
            var result = await _cloudinaryService.DestroyAsync(deletionParams);
            if (result.Error != null || result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception(result.Error!.Message);
            }

            // Step 2: Upload new file
            ImageUploadResult uploadResult = (ImageUploadResult)await UploadImageAsync(newfile);

            // Step 3: Update DB record
            var upload = await _context.FileUploads.FirstOrDefaultAsync(u =>
                u.PublicId == oldPublicId && u.UserId == userId
            );
            if (upload == null)
                return false;

            upload.Url = uploadResult.SecureUrl.ToString();
            upload.PublicId = uploadResult.PublicId;
            upload.FileType = uploadResult.ResourceType;
            upload.FileSize = uploadResult.Bytes;
            upload.UploadedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> UploadImageAsync(IFormFile file)
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation()
                    .Width(300)
                    .Height(300)
                    .Crop("fill")
                    .Gravity("face"),
            };

            var result = await _cloudinaryService.UploadAsync(uploadParams);
            if (result.Error != null || result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception(result.Error!.Message);
            }
            return result;
        }

        public async Task<FileUploads> UploadsAsync(string userId, IFormFile file)
        {
            var uploadResult = await UploadImageAsync(file) as ImageUploadResult;

            if (uploadResult == null || uploadResult.Error != null)
            {
                throw new Exception("Image upload failed");
            }

            User? user =
                await _context.Users.FindAsync(userId) ?? throw new Exception("User not found");
            var upload = new FileUploads
            {
                UserId = userId,
                Url = uploadResult!.SecureUrl.ToString(),
                PublicId = uploadResult.PublicId,
                FileType = uploadResult.ResourceType,
                FileSize = uploadResult.Bytes,
                UploadedAt = DateTime.UtcNow,
            };

            await _context.FileUploads.AddAsync(upload);
            await _context.SaveChangesAsync();
            return upload;
        }
    }
}

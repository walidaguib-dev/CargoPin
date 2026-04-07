using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Dtos;
using Domain.Entities;

namespace Application.Users.Mappers
{
    public static class UsersMapper
    {
        public static User MapToEntity(this RegisterUserDto dto)
        {
            return new User { UserName = dto.Username, Email = dto.Email };
        }
    }
}

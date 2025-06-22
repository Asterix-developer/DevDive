using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Only Admins can manage roles
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public RolesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddRole(RoleRequest request)
        {
            if (await _context.Roles.AnyAsync(r => r.Name == request.RoleName))
                return BadRequest("Role already exists");
            _context.Roles.Add(new Role { Name = request.RoleName });
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("remove")]
        public async Task<IActionResult> RemoveRole(RoleRequest request)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (role == null) return NotFound();
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRole(AssignRoleRequest request)
        {
            var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.UserName == request.UserName);
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (user == null || role == null) return NotFound();
            if (user.UserRoles.Any(ur => ur.RoleId == role.Id)) return BadRequest("User already has this role");
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("remove-from-user")]
        public async Task<IActionResult> RemoveRoleFromUser(AssignRoleRequest request)
        {
            var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.UserName == request.UserName);
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (user == null || role == null) return NotFound();
            var userRole = user.UserRoles.FirstOrDefault(ur => ur.RoleId == role.Id);
            if (userRole == null) return BadRequest("User does not have this role");
            user.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Repositories.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Base
{
    public class GenericRepository<T> where T : class
    {
        protected readonly SmashClubContext _context;
        public GenericRepository(SmashClubContext context)
        {
            _context = context;
        }

        public GenericRepository()
        {
            _context ??= new SmashClubContext();
        }
        public async Task<List<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }
        public async Task<List<T>> GetAllAtPageAsync(int pageNumber, int pageSize)
        {
            return await _context.Set<T>()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetMaxPage(int pageSize)
        {
            int totalCount = await _context.Set<T>().CountAsync();
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }

        public async Task<int> CreateAsync(T entity)
        {
            _context.Add(entity);
            return await _context.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(T entity)
        {
            _context.ChangeTracker.Clear();
            var tracker = _context.Attach(entity);
            tracker.State = EntityState.Modified;
            return await _context.SaveChangesAsync();
        }

        public async Task<bool> RemoveAsync(T entity)
        {
             _context.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task<T?> GetByIdAsync(string code)
        {
            return await _context.Set<T>().FindAsync(code);
        }

        public async Task<T?> GetByIdAsync(Guid code)
        {
            return await _context.Set<T>().FindAsync(code);
        }

        public void PrepareCreate(T entity)
        {
            _context.Add(entity);
        }

        public void PrepareUpdate(T entity)
        {
            var tracker = _context.Attach(entity);
            tracker.State = EntityState.Modified;
        }

        public void PrepareRemove(T entity)
        {
            _context.Remove(entity);
        }

        public int Save()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<bool> IsExists(int id)
        {
            return await _context.Set<T>().FindAsync(id) != null;
        }


        public async Task<bool> IsExists(string code)
        {
            return await _context.Set<T>().FindAsync(code) != null;
        }

        public async Task<bool> IsExists(Guid code)
        {
            return await _context.Set<T>().FindAsync(code) != null;
        }
    }
}

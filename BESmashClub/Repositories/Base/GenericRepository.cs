using Entites.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Base
{
    public class GenericRepository<T> where T : class
    {
        private readonly SportBookingContext _context;
    }
}

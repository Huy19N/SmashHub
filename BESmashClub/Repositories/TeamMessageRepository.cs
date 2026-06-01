using Entites.Models;
using Repositories.Base;
using Repositories.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class TeamMessageRepository : GenericRepository<TeamMessage>
    {

        public TeamMessageRepository(SmashClubContext context) : base(context) { }



    }
}

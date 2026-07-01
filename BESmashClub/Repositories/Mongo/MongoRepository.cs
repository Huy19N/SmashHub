using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using MongoDB.Bson;

namespace Repositories.Mongo
{
    public interface IMongoRepository<T> where T : class
    {
        Task<List<T>> GetAllAsync();
        Task<T> GetByIdAsync(string id);
        Task<List<T>> FindAsync(FilterDefinition<T> filter);
        Task<long> CountAsync(FilterDefinition<T> filter);
        Task CreateAsync(T entity);
        Task UpdateAsync(string id, T entity);
        Task DeleteAsync(string id);
        Task DeleteManyAsync(FilterDefinition<T> filter);
    }

    public class MongoRepository<T> : IMongoRepository<T> where T : class
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IConfiguration configuration, string collectionName)
        {
            var client = new MongoClient(configuration.GetSection("MongoSettings:ConnectionString").Value);
            var database = client.GetDatabase(configuration.GetSection("MongoSettings:DatabaseName").Value);
            _collection = database.GetCollection<T>(collectionName);
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public async Task<T> GetByIdAsync(string id)
        {
            var filter = Builders<T>.Filter.Eq("Id", id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<List<T>> FindAsync(FilterDefinition<T> filter)
        {
            return await _collection.Find(filter).ToListAsync();
        }

        public async Task<long> CountAsync(FilterDefinition<T> filter)
        {
            return await _collection.CountDocumentsAsync(filter);
        }

        public async Task CreateAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task UpdateAsync(string id, T entity)
        {
            var filter = Builders<T>.Filter.Eq("Id", id);
            await _collection.ReplaceOneAsync(filter, entity);
        }

        public async Task DeleteAsync(string id)
        {
            var filter = Builders<T>.Filter.Eq("Id", id);
            await _collection.DeleteOneAsync(filter);
        }

        public async Task DeleteManyAsync(FilterDefinition<T> filter)
        {
            await _collection.DeleteManyAsync(filter);
        }
    }
}

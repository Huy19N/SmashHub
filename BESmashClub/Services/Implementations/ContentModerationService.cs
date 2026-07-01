using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Services.Interfaces;

namespace Services.Implementations
{
    public class ContentModerationService : IContentModerationService
    {
        // Define a simple list of bad words. 
        // In a real production system, this could be fetched from DB or an external API.
        private readonly List<string> _badWords = new List<string>
        {
            "đụ", "địt", "lồn", "cặc", "buồi", "mẹ mày", "đĩ", "chó đẻ", "đồ ngu", "vcl", "đm", "vl", "cc"
        };

        public Task<bool> IsContentCleanAsync(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return Task.FromResult(true);
            }

            var lowerContent = content.ToLowerInvariant();
            
            // Check for exact word matches using regex to avoid false positives 
            // e.g., "vcl" inside another normal word shouldn't trigger unless separated.
            foreach (var badWord in _badWords)
            {
                // Pattern matches the bad word surrounded by word boundaries or whitespace
                var pattern = $@"\b{Regex.Escape(badWord)}\b";
                if (Regex.IsMatch(lowerContent, pattern))
                {
                    return Task.FromResult(false); // Found a bad word, content is not clean
                }
            }

            return Task.FromResult(true);
        }
    }
}

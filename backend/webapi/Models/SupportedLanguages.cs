using System.Collections.Generic;

namespace webapi.Models
{
    public static class SupportedLanguages
    {
        public static List<string> Languages { get; } = new List<string>
        {
            "JavaScript",
            "Python",
            "C#",
            "Java",
            "TypeScript",
            "C++",
            "Go",
            "Rust",
            "Kotlin",
            "Swift"
        };
    }
}

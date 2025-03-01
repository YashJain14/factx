import Keyword from "@/lib/types/Keyword";

export default async function generateBubbleData(data: Keyword[]) {
  // Flatten the array of arrays and count occurrences
  const wordCounts: Record<string, number> = {};
  data.forEach((row) => {
    try {
      // Handle both cases: when keywords is a string or an array
      const keywords = Array.isArray(row.keywords) 
        ? row.keywords 
        : (typeof row.keywords === 'string' ? JSON.parse(row.keywords) : []);
      
      // Make sure keywords is treated as an array
      if (Array.isArray(keywords)) {
        keywords.forEach((word) => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      }
    } catch (error) {
      console.error("Error processing keywords for row:", row, error);
    }
  });

  // Convert counts to an array and sort by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 15); // Get the top 15

  return sortedWords;
}
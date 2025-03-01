import "jsr:@std/dotenv/load";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

// Function to process tweets in batches
async function processExistingTweets() {
  console.log("Starting to process existing tweets...");
  
  // Track statistics
  let processed = 0;
  let errors = 0;
  let batchSize = 50; // Process 50 tweets at a time
  let hasMore = true;
  let lastId = null;
  
  while (hasMore) {
    try {
      // Query to get tweets that don't already have keywords
      let tweetsQuery = supabaseClient
        .from('tweets')
        .select('id, original_tweet_id, text')
        .limit(batchSize);
      
      // Add pagination if we have a lastId
      if (lastId) {
        tweetsQuery = tweetsQuery.gt('id', lastId);
      }
      
      // Execute the query
      const { data: tweets, error } = await tweetsQuery;
      
      if (error) {
        console.error("Error fetching tweets:", error);
        errors++;
        break;
      }
      
      // Exit loop if no more tweets
      if (!tweets || tweets.length === 0) {
        hasMore = false;
        console.log("No more tweets to process.");
        break;
      }
      
      // Update lastId for next iteration
      lastId = tweets[tweets.length - 1].id;
      
      // Check which tweets already have keywords
      const tweetIds = tweets.map(t => t.original_tweet_id || t.id);
      const { data: existingKeywords } = await supabaseClient
        .from('keywords')
        .select('original_tweet_id')
        .in('original_tweet_id', tweetIds);
      
      // Filter out tweets that already have keywords
      const existingIds = new Set(existingKeywords?.map(k => k.original_tweet_id) || []);
      const tweetsToProcess = tweets.filter(t => 
        !existingIds.has(t.original_tweet_id || t.id));
      
      console.log(`Found ${tweetsToProcess.length} tweets without keywords out of ${tweets.length} fetched.`);
      
      if (tweetsToProcess.length === 0) {
        continue; // Skip to next batch if nothing to process
      }
      
      // Process this batch of tweets
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/extract-keywords`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
          },
          body: JSON.stringify(tweetsToProcess)
        }
      );
      
      if (!response.ok) {
        console.error(`Batch processing error: ${response.status}`, await response.text());
        errors++;
      } else {
        const result = await response.json();
        processed += result.filter(r => r.status === "success").length;
        errors += result.filter(r => r.status === "error").length;
        
        console.log(`Processed ${processed} tweets so far. Errors: ${errors}`);
      }
      
    } catch (e) {
      console.error("Error in batch processing:", e);
      errors++;
    }
    
    // Optional: Add a slight delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Finished processing existing tweets. Total processed: ${processed}, Errors: ${errors}`);
  return { processed, errors };
}

// Serve the function
Deno.serve(async (req) => {
  if (req.method === "POST") {
    try {
      const results = await processExistingTweets();
      return new Response(
        JSON.stringify(results),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
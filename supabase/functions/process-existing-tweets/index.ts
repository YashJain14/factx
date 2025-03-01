import "jsr:@std/dotenv/load";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

// Function to directly process tweets using the Supabase client
async function processExistingTweets() {
  console.log("Starting to process existing tweets one by one with 3-second gaps...");
  
  // Statistics
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let hasMore = true;
  let lastId = null;
  
  try {
    while (hasMore) {
      // Get a single tweet
      let query = supabaseClient
        .from('tweets')
        .select('id, original_tweet_id, text')
        .order('id', { ascending: true })
        .limit(1);
      
      // Apply pagination if needed
      if (lastId) {
        query = query.gt('id', lastId);
      }
      
      const { data: tweets, error } = await query;
      
      if (error) {
        return { 
          success: false, 
          stage: "fetching tweet", 
          error: error.message,
          stats: { processed: totalProcessed, skipped: totalSkipped, errors: totalErrors }
        };
      }
      
      if (!tweets || tweets.length === 0) {
        hasMore = false;
        console.log("No more tweets to process");
        break;
      }
      
      // There should be only one tweet
      const tweet = tweets[0];
      
      // Update lastId for next iteration
      lastId = tweet.id;
      console.log(`Processing tweet: ${tweet.original_tweet_id}`);
      
      try {
        // Skip tweets without text
        if (!tweet.text) {
          console.log(`Skipping tweet ${tweet.original_tweet_id} - No text content`);
          totalSkipped++;
          // Wait 3 seconds before proceeding to next tweet
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        // Check if keywords already exist for this tweet
        const { data: existingKeywords } = await supabaseClient
          .from('keywords')
          .select('id')
          .eq('original_tweet_id', tweet.original_tweet_id)
          .limit(1);
        
        if (existingKeywords && existingKeywords.length > 0) {
          console.log(`Skipping tweet ${tweet.original_tweet_id} - Keywords already exist`);
          totalSkipped++;
          // Wait 3 seconds before proceeding to next tweet
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        // Extract simple keywords from text
        const simpleKeywords = tweet.text
          .toLowerCase()
          .replace(/[^\w\s#@]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 || word.startsWith('#') || word.startsWith('@'))
          .slice(0, 10);
        
        console.log(`Extracted keywords for ${tweet.original_tweet_id}: ${simpleKeywords.join(', ')}`);
        
        // Insert keywords into database
        const { error: insertError } = await supabaseClient
          .from('keywords')
          .insert([{ 
            original_tweet_id: tweet.original_tweet_id, 
            keywords: simpleKeywords 
          }]);
        
        if (insertError) {
          console.error(`Error for tweet ${tweet.original_tweet_id}: ${insertError.message}`);
          totalErrors++;
        } else {
          console.log(`Successfully processed tweet ${tweet.original_tweet_id}`);
          totalProcessed++;
        }
      } catch (e) {
        console.error(`Exception for tweet ${tweet.original_tweet_id}: ${e}`);
        totalErrors++;
      }
      
      console.log(`Progress: Processed=${totalProcessed}, Skipped=${totalSkipped}, Errors=${totalErrors}`);
      
      // Wait 3 seconds before proceeding to next tweet
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return { 
      success: true, 
      stats: {
        processed: totalProcessed,
        skipped: totalSkipped,
        errors: totalErrors
      }
    };
  } catch (error) {
    return { 
      success: false, 
      stage: "main process", 
      error: String(error),
      stats: { processed: totalProcessed, skipped: totalSkipped, errors: totalErrors }
    };
  }
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
        JSON.stringify({ success: false, error: String(error) }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { 
        status: 405,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
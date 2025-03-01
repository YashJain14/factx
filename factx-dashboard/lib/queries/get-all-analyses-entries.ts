import { supabaseClient } from "@/lib/supabase";

export default async function getAllAnalysesEntries() {
  console.log("Fetching analyses entries...");
  let allData: unknown[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  try {
    while (hasMore) {
      console.log(`Fetching analyses range ${from}-${to}`);
      const { data, error } = await supabaseClient
        .from("analyses")
        .select("original_tweet_id,is_misleading")
        .range(from, to);
      
      if (error) {
        console.error("Supabase error:", error);
        break;
      }
      
      console.log(`Received ${data?.length || 0} analyses records`);
      allData = allData.concat(data || []);
      from += 1000;
      to += 1000;

      // Stop fetching if less than 1000 rows are returned
      if ((data || []).length < 1000) {
        hasMore = false;
      }
    }
    
    console.log(`Total analyses entries: ${allData.length}`);
    return allData;
  } catch (err) {
    console.error("Error in getAllAnalysesEntries:", err);
    return [];
  }
}
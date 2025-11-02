import { supabase } from "@/integrations/supabase/client";

/**
 * Gets or creates the daily fact for a user
 * - Returns the same fact for the entire day
 * - Never returns a fact the user has already learned
 * - Only returns facts matching user preferences
 */
export async function getDailyFactForUser(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if user already has a fact assigned for today
    const { data: existingAssignment } = await supabase
      .from('daily_fact_assignments')
      .select(`
        fact_id,
        historical_facts (
          id,
          title,
          title_fr,
          description,
          description_fr,
          date_text,
          date_text_fr,
          image_url,
          period_id,
          difficulty,
          region,
          region_fr,
          points_reward,
          tags,
          tags_fr,
          historical_periods (name)
        )
      `)
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (existingAssignment?.historical_facts) {
      return existingAssignment.historical_facts;
    }

    // Get all facts the user has already seen (completed or previously assigned)
    const { data: seenFacts } = await supabase
      .from('user_progress')
      .select('fact_id')
      .eq('user_id', userId)
      .eq('completed', true);

    const { data: previouslyAssigned } = await supabase
      .from('daily_fact_assignments')
      .select('fact_id')
      .eq('user_id', userId);

    const seenFactIds = [
      ...(seenFacts?.map(f => f.fact_id) || []),
      ...(previouslyAssigned?.map(f => f.fact_id) || [])
    ];

    // Get user preferences for better fact selection
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_regions, preferred_eras, preferred_tags, preferred_difficulty')
      .eq('id', userId)
      .single();

    const preferredRegions = profile?.preferred_regions || [];
    const preferredEras = profile?.preferred_eras || [];
    const preferredTags = profile?.preferred_tags || [];
    const preferredDifficulty = profile?.preferred_difficulty || [];

    // Fetch all available facts with French columns
    let query = supabase
      .from('historical_facts')
      .select('*, historical_periods(name)');

    if (seenFactIds.length > 0) {
      query = query.not('id', 'in', `(${seenFactIds.join(',')})`);
    }

    const { data: availableFacts } = await query;

    if (!availableFacts || availableFacts.length === 0) {
      return null;
    }

    // Filter facts by user preferences (flexible filtering)
    const filteredFacts = availableFacts.filter((fact) => {
      // If no preferences set, show all facts
      if (preferredRegions.length === 0 && preferredEras.length === 0 && preferredTags.length === 0 && preferredDifficulty.length === 0) {
        return true;
      }

      // Case-insensitive region matching
      const matchesRegion = preferredRegions.length === 0 || 
        (fact.region && preferredRegions.some((region: string) => 
          region.toLowerCase() === fact.region.toLowerCase()
        ));

      const periodName = fact.historical_periods?.name || '';
      const matchesEra = preferredEras.length === 0 ||
        preferredEras.some((era: string) => 
          periodName.toLowerCase().includes(era.toLowerCase())
        );

      const factTags = fact.tags || [];
      const matchesTags = preferredTags.length === 0 ||
        preferredTags.some((tag: string) => 
          factTags.some((factTag: string) => 
            factTag.toLowerCase().includes(tag.toLowerCase())
          )
        );

      const matchesDifficulty = preferredDifficulty.length === 0 ||
        (fact.difficulty && preferredDifficulty.includes(fact.difficulty));

      // Fact must match at least ONE preference category (OR logic)
      // This is more permissive and will show more facts
      return matchesRegion || matchesEra || matchesTags || matchesDifficulty;
    });

    if (filteredFacts.length === 0) {
      return null;
    }

    // Sort filtered facts by preference match strength (case-insensitive)
    const sortedFacts = filteredFacts.sort((a, b) => {
      const aMatchesRegion = a.region && preferredRegions.some((region: string) => 
        region.toLowerCase() === a.region.toLowerCase()
      );
      const bMatchesRegion = b.region && preferredRegions.some((region: string) => 
        region.toLowerCase() === b.region.toLowerCase()
      );
      
      const aPeriodName = a.historical_periods?.name || '';
      const bPeriodName = b.historical_periods?.name || '';
      
      const aMatchesEra = preferredEras.some((era: string) => 
        aPeriodName.toLowerCase().includes(era.toLowerCase())
      );
      const bMatchesEra = preferredEras.some((era: string) => 
        bPeriodName.toLowerCase().includes(era.toLowerCase())
      );

      const aFactTags = a.tags || [];
      const bFactTags = b.tags || [];
      const aMatchesTags = preferredTags.some((tag: string) => 
        aFactTags.some((factTag: string) => factTag.toLowerCase().includes(tag.toLowerCase()))
      );
      const bMatchesTags = preferredTags.some((tag: string) => 
        bFactTags.some((factTag: string) => factTag.toLowerCase().includes(tag.toLowerCase()))
      );

      const aMatchesDifficulty = a.difficulty && preferredDifficulty.includes(a.difficulty);
      const bMatchesDifficulty = b.difficulty && preferredDifficulty.includes(b.difficulty);

      const aScore = (aMatchesRegion ? 4 : 0) + (aMatchesEra ? 3 : 0) + (aMatchesTags ? 2 : 0) + (aMatchesDifficulty ? 1 : 0);
      const bScore = (bMatchesRegion ? 4 : 0) + (bMatchesEra ? 3 : 0) + (bMatchesTags ? 2 : 0) + (bMatchesDifficulty ? 1 : 0);
      
      return bScore - aScore;
    });

    // Select the best matching fact
    const selectedFact = sortedFacts[0];

    // Assign this fact for today
    await supabase
      .from('daily_fact_assignments')
      .insert({
        user_id: userId,
        fact_id: selectedFact.id,
        date: today
      });

    return selectedFact;
  } catch (error) {
    console.error('Error getting daily fact:', error);
    return null;
  }
}
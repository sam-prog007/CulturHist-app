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
      .select('fact_id, historical_facts(*)')
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
      .select('preferred_regions, preferred_eras, preferred_tags')
      .eq('id', userId)
      .single();

    const preferredRegions = profile?.preferred_regions || [];
    const preferredEras = profile?.preferred_eras || [];
    const preferredTags = profile?.preferred_tags || [];

    // Fetch all available facts
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

    // Filter facts by user preferences first (strict filtering)
    const filteredFacts = availableFacts.filter((fact) => {
      // If no preferences set, show all facts
      if (preferredRegions.length === 0 && preferredEras.length === 0 && preferredTags.length === 0) {
        return true;
      }

      const matchesRegion = preferredRegions.length === 0 || 
        (fact.region && preferredRegions.includes(fact.region));

      const periodName = fact.historical_periods?.name || '';
      const matchesEra = preferredEras.length === 0 ||
        preferredEras.some((era: string) => 
          periodName.toLowerCase().includes(era.toLowerCase())
        );

      const factTags = fact.tags || [];
      const matchesTags = preferredTags.length === 0 ||
        preferredTags.some((tag: string) => 
          factTags.includes(tag.toLowerCase())
        );

      // Fact must match all preference categories (if that category has preferences)
      return matchesRegion && matchesEra && matchesTags;
    });

    if (filteredFacts.length === 0) {
      return null;
    }

    // Sort filtered facts by preference match strength
    const sortedFacts = filteredFacts.sort((a, b) => {
      const aMatchesRegion = a.region && preferredRegions.includes(a.region);
      const bMatchesRegion = b.region && preferredRegions.includes(b.region);
      
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
      const aMatchesTags = preferredTags.some((tag: string) => aFactTags.includes(tag.toLowerCase()));
      const bMatchesTags = preferredTags.some((tag: string) => bFactTags.includes(tag.toLowerCase()));

      const aScore = (aMatchesRegion ? 3 : 0) + (aMatchesEra ? 2 : 0) + (aMatchesTags ? 1 : 0);
      const bScore = (bMatchesRegion ? 3 : 0) + (bMatchesEra ? 2 : 0) + (bMatchesTags ? 1 : 0);
      
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
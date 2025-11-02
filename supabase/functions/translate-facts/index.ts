import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema for AI translation responses
const translationSchema = z.object({
  title_fr: z.string().trim().max(500, "Title too long"),
  description_fr: z.string().trim().max(2000, "Description too long"),
  date_text_fr: z.string().trim().max(200, "Date text too long").optional(),
  region_fr: z.string().trim().max(200, "Region too long").optional(),
  tags_fr: z.array(z.string().trim().max(100, "Tag too long")).max(20, "Too many tags").optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin'
    });

    if (roleError || !hasAdminRole) {
      console.log(`Non-admin user ${userData.user.id} attempted to access translate-facts`);
      return new Response(
        JSON.stringify({ error: "Access denied. Admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin user ${userData.user.id} starting translation batch`);

    // Fetch all facts without French translations
    const { data: facts, error: fetchError } = await supabase
      .from('historical_facts')
      .select('*')
      .is('title_fr', null);

    if (fetchError) throw fetchError;
    if (!facts || facts.length === 0) {
      return new Response(
        JSON.stringify({ message: "Tous les faits sont déjà traduits" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Traduction de ${facts.length} faits...`);

    // Translate facts one by one (to avoid rate limits)
    let translated = 0;
    for (const fact of facts) {
      try {
        // Prepare translation request
        const prompt = `Translate the following historical fact from English to French. Return ONLY a valid JSON object with these exact keys: title_fr, description_fr, date_text_fr, region_fr, tags_fr (array of strings).

English fact:
- Title: ${fact.title}
- Description: ${fact.description}
- Date: ${fact.date_text || 'N/A'}
- Region: ${fact.region || 'N/A'}
- Tags: ${JSON.stringify(fact.tags || [])}

Important: Maintain historical accuracy and proper French terminology.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a professional translator specializing in historical content. Always respond with valid JSON only."
              },
              {
                role: "user",
                content: prompt
              }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI error for fact ${fact.id}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error(`No content for fact ${fact.id}`);
          continue;
        }

        // Parse AI response (remove markdown code blocks if present)
        let translatedData;
        try {
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsedData = JSON.parse(cleanContent);
          
          // Validate with Zod schema
          translatedData = translationSchema.parse(parsedData);
        } catch (parseError) {
          console.error(`Parse or validation error for fact ${fact.id}:`, parseError);
          continue;
        }

        // Update fact with French translations
        const { error: updateError } = await supabase
          .from('historical_facts')
          .update({
            title_fr: translatedData.title_fr,
            description_fr: translatedData.description_fr,
            date_text_fr: translatedData.date_text_fr || fact.date_text,
            region_fr: translatedData.region_fr || fact.region,
            tags_fr: translatedData.tags_fr || fact.tags,
          })
          .eq('id', fact.id);

        if (updateError) {
          console.error(`Update error for fact ${fact.id}:`, updateError);
          continue;
        }

        translated++;
        console.log(`✓ Traduit: ${fact.title} -> ${translatedData.title_fr}`);

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error translating fact ${fact.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: `${translated}/${facts.length} faits traduits avec succès`,
        translated,
        total: facts.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IARE_SYSTEM_PROMPT = `You are a friendly and helpful AI Assistant for the Institute of Aeronautical Engineering (IARE), Dundigal, Hyderabad. Your role is to assist students, parents, and visitors with IARE-specific queries.

About IARE:
- Full Name: Institute of Aeronautical Engineering
- Location: Dundigal, Hyderabad, Telangana, India
- Established: 2000
- Affiliation: Jawaharlal Nehru Technological University Hyderabad (JNTUH)
- Accreditation: NAAC 'A' Grade, NBA Accredited programs
- Campus: 32 acres with modern infrastructure

Departments & Courses:
- Aeronautical Engineering
- Computer Science & Engineering (CSE)
- Information Technology (IT)
- Electronics & Communication Engineering (ECE)
- Electrical & Electronics Engineering (EEE)
- Mechanical Engineering
- Civil Engineering
- MBA & MCA programs

Key Information:
- Admissions: Through TS EAMCET / ECET / ICET / Management quota
- Academic Year: June to May
- Placements: 90%+ placement record with top recruiters like TCS, Infosys, Wipro, Amazon, Microsoft
- Facilities: Library, hostels, sports complex, labs, Wi-Fi campus, cafeteria
- Contact: +91-40-24193276, info@iare.ac.in
- Website: www.iare.ac.in

Guidelines:
- Be polite, accurate, and helpful
- Answer ONLY IARE-related queries
- For non-IARE questions, politely redirect to IARE topics
- If unsure, suggest contacting the college directly
- Keep responses concise and student-friendly

Remember: You represent IARE, maintain professionalism and helpfulness.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
    if (!GROK_API_KEY) {
      console.error('GROK_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please contact administrator.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: IARE_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Grok API with model grok-2-latest...');

    // Call Grok API - using grok-2-latest which is confirmed to work
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();
    console.log('Grok API response status:', response.status);

    if (!response.ok) {
      console.error('Grok API error:', response.status, responseText);
      
      let errorDetails = responseText;
      try {
        const parsed = JSON.parse(responseText);
        errorDetails = parsed.error || parsed.message || responseText;
      } catch {
        // ignore
      }

      // Check for specific error types
      if (responseText.toLowerCase().includes('incorrect api key') || 
          responseText.toLowerCase().includes('invalid api key')) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API key. Please update the GROK_API_KEY in backend settings.',
            details: errorDetails 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'AI service error. Please try again.',
          details: errorDetails,
          status: response.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(responseText);
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    console.log('Grok API response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-grok function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

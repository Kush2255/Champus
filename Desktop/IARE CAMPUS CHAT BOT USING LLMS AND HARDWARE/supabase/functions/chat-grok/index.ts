import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IARE_SYSTEM_PROMPT = `You are the official information system of the Institute of Aeronautical Engineering (IARE), Dundigal, Hyderabad. Your responsibility is to provide ONLY accurate, verified, and official information.

CURRENT YEAR: 2026. TODAY'S DATE CONTEXT: The current academic year is 2025-2026.

CRITICAL YEAR ENFORCEMENT:
- ALL responses MUST reflect 2026 data ONLY.
- NEVER return holidays, events, schedules, or any data from 2024 or 2025 or any previous year.
- If you find yourself about to output a date from 2024 or 2025, STOP and instead say: "No updated data available for 2026. Please refer to the official IARE website (www.iare.ac.in) for the latest notification."
- When asked about holidays, you MUST provide the 2026 Indian national and regional holidays list. Do NOT copy-paste any 2024 or 2025 holiday list.
- Double-check every single date in your response — if any date year is not 2026, remove it.

2026 INDIAN NATIONAL HOLIDAYS (Use these as base for IARE holiday calendar):
| Date | Day | Occasion |
|------|-----|----------|
| 01-Jan-2026 | Thursday | New Year's Day |
| 14-Jan-2026 | Wednesday | Makar Sankranti / Pongal |
| 26-Jan-2026 | Monday | Republic Day |
| 17-Mar-2026 | Tuesday | Holi |
| 30-Mar-2026 | Monday | Ugadi |
| 02-Apr-2026 | Thursday | Ramadan (Eid ul-Fitr - tentative) |
| 03-Apr-2026 | Friday | Good Friday |
| 14-Apr-2026 | Tuesday | Dr. B.R. Ambedkar Jayanti |
| 01-May-2026 | Friday | May Day |
| 07-May-2026 | Thursday | Buddha Purnima |
| 09-Jun-2026 | Tuesday | Eid ul-Adha (tentative) |
| 09-Jul-2026 | Thursday | Milad-un-Nabi (tentative) |
| 15-Aug-2026 | Saturday | Independence Day |
| 25-Aug-2026 | Tuesday | Vinayaka Chavithi |
| 02-Oct-2026 | Friday | Gandhi Jayanti |
| 02-Oct-2026 | Friday | Dussehra (Vijaya Dashami) |
| 20-Oct-2026 | Tuesday | Deepavali |
| 04-Nov-2026 | Wednesday | Eid Milad-un-Nabi (tentative) |
| 25-Dec-2026 | Friday | Christmas |

Additional IARE-specific academic breaks for 2025-2026:
- Summer Vacation: May 2026 (after end-semester exams)
- Dasara Break: Late September / Early October 2026
- Semester Break: December 2026

STRICT RULES:
1. Do NOT generate or guess any data. Use the 2026 holiday data provided above.
2. Always follow the latest information exactly as published on the official IARE website.
3. If the user asks about holidays, display the holiday list for 2026 WITH EXACT DATE, DAY, and OCCASION in a table format using the data above.
4. Never give generic answers. Format answers clearly using markdown tables when applicable.
5. If updated information is unavailable for 2026, respond: "No updated data available for 2026. Please refer to the official IARE website (www.iare.ac.in) for the latest notification."
6. Always prioritize correctness over speed.
7. Do NOT hallucinate any academic schedules, events, or announcements.
8. Maintain a professional institutional tone — not conversational, not casual.
9. You are an INFORMATION SYSTEM, not a general chatbot. Accuracy is mandatory.
10. When responding to queries about academic calendar, holidays, events, exam schedules, notices, placements, or internships — ensure the year is 2026.
11. NEVER provide information from 2024 or 2025 academic years unless explicitly asked for historical data.
12. BEFORE outputting any response, scan all dates — if any year is not 2026, replace or remove them.

About IARE (Verified Official Information):
- Full Name: Institute of Aeronautical Engineering
- Location: Dundigal, Hyderabad, Telangana, India
- Established: 2000
- Affiliation: Jawaharlal Nehru Technological University Hyderabad (JNTUH)
- Accreditation: Institute of Aeronautical Engineering is accredited by NAAC with 'A++' Grade. NBA Accredited programs.
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
- Answer ONLY IARE-related queries
- For non-IARE questions, politely redirect to IARE topics
- If unsure, suggest contacting the college directly or visiting www.iare.ac.in
- All institutional data must reflect official website content, latest notifications, and verified academic calendar
- Do NOT use old or assumed accreditation wording

SPECIAL CAPABILITIES:
- If the user's message starts with [IMAGE_GEN], generate a detailed description of the requested image. Respond with a JSON block: {"type":"image_request","prompt":"detailed description"}
- If the user asks you to generate, create, or draw an image, treat it as an image generation request.`;

// Model configurations
const MODELS: Record<string, { provider: 'grok' | 'lovable'; model: string; label: string }> = {
  'grok': { provider: 'grok', model: 'grok-3-latest', label: 'Grok 3' },
  'gemini-pro': { provider: 'lovable', model: 'google/gemini-2.5-pro', label: 'Gemini Pro' },
  'gemini-flash': { provider: 'lovable', model: 'google/gemini-3-flash-preview', label: 'Gemini Flash' },
  'gpt5': { provider: 'lovable', model: 'openai/gpt-5', label: 'GPT-5' },
  'gpt5-mini': { provider: 'lovable', model: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
};

async function callGrok(messages: Array<{ role: string; content: string }>, apiKey: string) {
  console.log('Attempting Grok API with model grok-3-latest...');
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'grok-3-latest', messages, max_tokens: 1024, temperature: 0.7 }),
  });
  const text = await response.text();
  console.log('Grok API response status:', response.status);
  if (!response.ok) {
    console.error('Grok API error:', response.status, text);
    return { ok: false, status: response.status, errorDetails: text };
  }
  const data = JSON.parse(text);
  return { ok: true, response: data.choices?.[0]?.message?.content };
}

async function callLovableAI(messages: Array<{ role: string; content: string }>, apiKey: string, model: string) {
  console.log(`Calling Lovable AI with model ${model}...`);
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages }),
  });
  const text = await response.text();
  console.log('Lovable AI response status:', response.status);
  if (!response.ok) {
    console.error('Lovable AI error:', response.status, text);
    return { ok: false, status: response.status, errorDetails: text };
  }
  const data = JSON.parse(text);
  return { ok: true, response: data.choices?.[0]?.message?.content };
}

async function generateImage(prompt: string, apiKey: string) {
  console.log('Generating image with prompt:', prompt);
  
  const models = ['google/gemini-3-pro-image-preview', 'google/gemini-2.5-flash-image'];
  
  for (const model of models) {
    console.log(`Trying image generation with model: ${model}`);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: `Generate an image: ${prompt}` }],
        modalities: ['image', 'text'],
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(`Image gen error with ${model}:`, response.status, text);
      if (response.status === 429 || response.status === 402) {
        return { ok: false, status: response.status, errorDetails: text };
      }
      continue;
    }
    const data = JSON.parse(text);
    const images = data.choices?.[0]?.message?.images;
    const content = data.choices?.[0]?.message?.content || '';
    
    if (images && images.length > 0) {
      console.log(`Image generated successfully with ${model}, ${images.length} image(s)`);
      return { ok: true, response: content, images };
    }
    console.log(`Model ${model} returned no images, trying next...`);
  }
  
  return { ok: false, status: 500, errorDetails: 'No images generated by any model' };
}

async function searchRealImages(query: string, options: { count?: number; orientation?: string; size?: string; color?: string } = {}) {
  const { count = 8, orientation, size, color } = options;
  
  const images: Array<{ type: string; image_url: { url: string }; alt: string; source_url: string }> = [];
  const seenUrls = new Set<string>();

  // Primary: Bing Image Search with multiple extraction methods
  try {
    // Request more results than needed to allow filtering
    let bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&count=35`;
    
    const filters: string[] = [];
    if (size === 'large') filters.push('filterui:imagesize-large');
    else if (size === 'medium') filters.push('filterui:imagesize-medium');
    else if (size === 'small') filters.push('filterui:imagesize-small');
    if (orientation === 'landscape') filters.push('filterui:aspect-wide');
    else if (orientation === 'portrait') filters.push('filterui:aspect-tall');
    else if (orientation === 'square') filters.push('filterui:aspect-square');
    if (color) filters.push(`filterui:color2-FGcls_${color.toUpperCase()}`);
    if (filters.length > 0) bingUrl += `&qft=+${filters.join('+')}`;

    console.log('Searching Bing Images for:', query, 'URL:', bingUrl);
    const bingResponse = await fetch(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });
    const bingHtml = await bingResponse.text();
    console.log('Bing HTML length:', bingHtml.length);
    
    // Method 1: Extract from mediaurl= parameter in href links (most reliable)
    const mediaurlRegex = /mediaurl=(https?%3[aA]%2[fF]%2[fF][^&"'\s]+)/gi;
    let match;
    while ((match = mediaurlRegex.exec(bingHtml)) !== null && images.length < count) {
      let url = decodeURIComponent(match[1]);
      // Skip Bing's own resources
      if (url.includes('bing.com') || url.includes('microsoft.com')) continue;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      images.push({
        type: 'image_url',
        image_url: { url },
        alt: query,
        source_url: url,
      });
    }
    
    // Method 2: Extract from JSON "murl" in data attributes
    if (images.length < count) {
      const murlRegex = /"murl"\s*:\s*"(https?:[^"]+)"/gi;
      while ((match = murlRegex.exec(bingHtml)) !== null && images.length < count) {
        let url = match[1]
          .replace(/\\u002f/gi, '/')
          .replace(/\\u0026/gi, '&')
          .replace(/\\u003d/gi, '=')
          .replace(/\\\//g, '/');
        if (url.includes('bing.com') || url.includes('microsoft.com')) continue;
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        images.push({
          type: 'image_url',
          image_url: { url },
          alt: query,
          source_url: url,
        });
      }
    }

    // Method 3: Extract from thumbnail src and convert to full-size (th.bing.com -> original via cdnurl)
    if (images.length < count) {
      const cdnurlRegex = /cdnurl=(https?%3[aA]%2[fF]%2[fF][^&"'\s]+)/gi;
      while ((match = cdnurlRegex.exec(bingHtml)) !== null && images.length < count) {
        let url = decodeURIComponent(match[1]);
        if (url.includes('bing.com') || url.includes('microsoft.com')) continue;
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        images.push({
          type: 'image_url',
          image_url: { url },
          alt: query,
          source_url: url,
        });
      }
    }
    
    console.log(`Bing returned ${images.length} images`);
  } catch (error) {
    console.error('Bing search error:', error);
  }

  // Fallback: Only use Wikimedia if Bing returned fewer than 3 results
  if (images.length < 3) {
    try {
      const needed = count - images.length;
      console.log('Searching Wikimedia Commons for:', query, `(need ${needed} more)`);
      const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=${needed + 5}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json&origin=*`;
      const wikiResponse = await fetch(wikiUrl);
      const wikiData = await wikiResponse.json();
      
      if (wikiData.query?.pages) {
        for (const page of Object.values(wikiData.query.pages) as any[]) {
          if (images.length >= count) break;
          const info = page.imageinfo?.[0];
          if (!info?.url) continue;
          // Skip SVGs, PDFs, tiny images, and non-photo content
          if (info.mime?.includes('svg') || info.mime?.includes('pdf')) continue;
          if (info.width < 300 || info.height < 200) continue;
          const url = info.thumburl || info.url;
          if (seenUrls.has(url)) continue;
          seenUrls.add(url);
          images.push({
            type: 'image_url',
            image_url: { url },
            alt: page.title?.replace('File:', '') || query,
            source_url: info.descriptionurl || url,
          });
        }
      }
      console.log(`After Wikimedia, total ${images.length} images`);
    } catch (error) {
      console.error('Wikimedia search error:', error);
    }
  }

  return { ok: images.length > 0, images, total: images.length };
}

async function editImage(prompt: string, sourceImageUrl: string, apiKey: string) {
  console.log('Editing image with prompt:', prompt);
  
  const models = ['google/gemini-3-pro-image-preview', 'google/gemini-2.5-flash-image'];
  
  for (const model of models) {
    console.log(`Trying image edit with model: ${model}`);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: sourceImageUrl } },
          ],
        }],
        modalities: ['image', 'text'],
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(`Image edit error with ${model}:`, response.status, text);
      if (response.status === 429 || response.status === 402) {
        return { ok: false, status: response.status, errorDetails: text };
      }
      continue;
    }
    const data = JSON.parse(text);
    const images = data.choices?.[0]?.message?.images;
    const content = data.choices?.[0]?.message?.content || '';
    
    if (images && images.length > 0) {
      console.log(`Image edited successfully with ${model}`);
      return { ok: true, response: content, images };
    }
    console.log(`Model ${model} returned no images for edit, trying next...`);
  }
  
  return { ok: false, status: 500, errorDetails: 'No images generated by any model' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');

    if (!GROK_API_KEY && !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let { message, conversationHistory = [], selectedModel = 'grok', generateImageRequest = false, editImageRequest = false, sourceImageUrl = '', searchRealImagesRequest = false, imageSearchFilters = {} } = await req.json();

    // Auto-detect real image search requests
    const lowerMsg = message?.toLowerCase() || '';
    const realImageKeywords = ['real photo', 'real picture', 'real image', 'real pics', 'stock photo', 'actual photo', 'find photo', 'find image', 'find picture', 'search photo', 'search image', 'search picture', 'show me photos', 'show me pictures', 'show me images', 'pics of', 'photos of', 'pictures of', 'images of'];
    const aiExclusions = ['generate', 'create', 'draw', 'design', 'make an', 'ai image', 'ai photo'];
    const hasRealKeyword = realImageKeywords.some(k => lowerMsg.includes(k));
    const hasAiExclusion = aiExclusions.some(k => lowerMsg.includes(k));
    
    // Detect "college/collage/institute images" pattern as real image search
    const isPlaceImageQuery = /\b(college|collage|institute|university|campus|school)\b/.test(lowerMsg) && /\b(images?|photos?|pictures?|pics)\b/.test(lowerMsg);
    // Detect "college + specific place/building" as real image search (e.g. "IARE college auditorium")
    const isCollegePlaceQuery = /\b(college|collage|institute|university|campus)\b/.test(lowerMsg) && /\b(auditorium|hostel|library|lab|canteen|cafeteria|playground|ground|gate|entrance|building|block|department|corridor|garden|park|stadium|gym|hall|room|class|seminar)\b/.test(lowerMsg);
    
    if (!searchRealImagesRequest && !hasAiExclusion && (hasRealKeyword || isPlaceImageQuery || isCollegePlaceQuery)) {
      searchRealImagesRequest = true;
    }

    // Auto-detect image generation requests (fuzzy matching for typos)
    // IMPORTANT: Skip auto-detect if searchRealImagesRequest is already explicitly set
    if (!searchRealImagesRequest) {
      const imgKeywords = ['image', 'picture', 'photo', 'illustration', 'drawing', 'iamge', 'imge', 'pictur'];
      const genKeywords = ['generate', 'create', 'draw', 'make', 'genrate', 'genrete', 'creat', 'design', 'show', 'give', 'build'];
      // "collage" only triggers AI gen when combined with explicit gen keywords
      const standaloneImgTriggers = ['poster', 'banner', 'wallpaper', 'artwork', 'sketch'];
      const hasImgWord = imgKeywords.some(k => lowerMsg.includes(k));
      const hasGenWord = genKeywords.some(k => lowerMsg.includes(k));
      const hasStandaloneTrigger = standaloneImgTriggers.some(k => lowerMsg.includes(k));
      const isExplicitCollage = lowerMsg.includes('collage') && genKeywords.some(k => lowerMsg.includes(k));
      if (!generateImageRequest && (
        (hasImgWord && hasGenWord) ||
        hasStandaloneTrigger ||
        isExplicitCollage ||
        lowerMsg.startsWith('draw ') ||
        lowerMsg.startsWith('/image ')
      )) {
        generateImageRequest = true;
      }
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Message too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!Array.isArray(conversationHistory) || conversationHistory.length > 20) {
      return new Response(JSON.stringify({ error: 'Invalid conversation history' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    for (const msg of conversationHistory) {
      if (!msg || typeof msg !== 'object' || !msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: 'Invalid message structure' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (typeof msg.content !== 'string' || msg.content.length > 10000) {
        return new Response(JSON.stringify({ error: 'Message content invalid or too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: 'Invalid message role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Handle real image search requests (no API key needed - uses Google Images)
    if (searchRealImagesRequest) {
      // Better query extraction: remove only filler words, keep the subject
      let searchQuery = message
        .replace(/^(show me |find |search for |search |get |give me |give )/i, '')
        .replace(/(real |stock |actual |original )?(photos?|pictures?|images?|pics?) ?(of |about |for |from )?/gi, '')
        .replace(/\b(please|pls|the|some|a |an )\b/gi, '')
        .replace(/\bcollage\b/gi, 'college')  // Fix common misspelling
        .replace(/\s+/g, ' ')
        .trim() || message;
      const searchResult = await searchRealImages(searchQuery, { count: imageSearchFilters.count || 6, orientation: imageSearchFilters.orientation, size: imageSearchFilters.size, color: imageSearchFilters.color });
      if (searchResult.ok && searchResult.images?.length) {
        return new Response(JSON.stringify({
          response: `Here are real photos for "${searchQuery}" (${searchResult.images.length} results found):`,
          provider: 'web',
          images: searchResult.images,
          isRealImages: true,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Fall through to AI generation if no real images found
      generateImageRequest = true;
    }

    // Handle image edit requests
    if (editImageRequest && sourceImageUrl && LOVABLE_API_KEY) {
      const editResult = await editImage(message, sourceImageUrl, LOVABLE_API_KEY);
      if (editResult.ok) {
        return new Response(JSON.stringify({
          response: editResult.response || 'Here is your edited image:',
          provider: 'lovable-ai-image-edit',
          images: editResult.images || [],
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (editResult.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (editResult.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Image editing failed.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Handle image generation requests
    if (generateImageRequest && LOVABLE_API_KEY) {
      const imgResult = await generateImage(message, LOVABLE_API_KEY);
      if (imgResult.ok) {
        return new Response(JSON.stringify({
          response: imgResult.response || 'Here is your generated image:',
          provider: 'lovable-ai-image',
          images: imgResult.images || [],
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (imgResult.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (imgResult.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Image generation failed.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const messages_arr = [
      { role: 'system', content: IARE_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message },
    ];

    let aiResponse: string | undefined;
    let usedProvider = 'none';
    const modelConfig = MODELS[selectedModel] || MODELS['grok'];

    // Try selected model first
    if (modelConfig.provider === 'grok' && GROK_API_KEY) {
      const result = await callGrok(messages_arr, GROK_API_KEY);
      if (result.ok && result.response) {
        aiResponse = result.response;
        usedProvider = 'grok';
      } else {
        const shouldFallback = [400, 403, 404, 429, 500, 502, 503].includes(result.status ?? 0);
        if (!shouldFallback) {
          return new Response(JSON.stringify({ error: 'AI provider error.', status: result.status }), { status: result.status ?? 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    } else if (modelConfig.provider === 'lovable' && LOVABLE_API_KEY) {
      const result = await callLovableAI(messages_arr, LOVABLE_API_KEY, modelConfig.model);
      if (result.ok && result.response) {
        aiResponse = result.response;
        usedProvider = modelConfig.label;
      } else {
        if (result.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (result.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // Fallback chain
    if (!aiResponse && GROK_API_KEY && modelConfig.provider !== 'grok') {
      const grokResult = await callGrok(messages_arr, GROK_API_KEY);
      if (grokResult.ok && grokResult.response) { aiResponse = grokResult.response; usedProvider = 'grok (fallback)'; }
    }
    if (!aiResponse && LOVABLE_API_KEY) {
      const lovResult = await callLovableAI(messages_arr, LOVABLE_API_KEY, 'google/gemini-3-flash-preview');
      if (lovResult.ok && lovResult.response) { aiResponse = lovResult.response; usedProvider = 'gemini-flash (fallback)'; }
    }

    if (!aiResponse) {
      return new Response(JSON.stringify({ error: 'No AI provider could fulfill the request.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Post-process: if the text model returned an image_request JSON, generate the actual image
    if (aiResponse && LOVABLE_API_KEY) {
      try {
        const parsed = JSON.parse(aiResponse);
        if (parsed?.type === 'image_request' && parsed?.prompt) {
          console.log('Text model returned image_request JSON, generating image...');
          const imgResult = await generateImage(parsed.prompt, LOVABLE_API_KEY);
          if (imgResult.ok) {
            return new Response(JSON.stringify({
              response: imgResult.response || 'Here is your generated image:',
              provider: 'lovable-ai-image',
              images: imgResult.images || [],
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      } catch {
        // Not JSON, proceed normally
      }
    }

    console.log(`Response generated via ${usedProvider}`);
    return new Response(JSON.stringify({ response: aiResponse, provider: usedProvider }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in chat-grok function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

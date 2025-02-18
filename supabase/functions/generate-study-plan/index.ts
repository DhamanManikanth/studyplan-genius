
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

  try {
    const { subjects, examDate, studyHours, goals, learningStyle } = await req.json();

    const prompt = `Generate a detailed study plan with the following information:
    Subjects: ${subjects.join(', ')}
    Exam Date: ${examDate}
    Daily Study Hours: ${studyHours}
    Learning Style: ${learningStyle}
    Goals: ${goals}

    Please create a comprehensive study schedule that:
    1. Distributes the available study hours across subjects
    2. Suggests specific learning activities based on the learning style
    3. Includes breaks and revision periods
    4. Provides measurable milestones
    5. Adapts to the exam timeline`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [{
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }]
      }),
    });

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ plan: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

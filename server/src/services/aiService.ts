/**
 * AI Service — EcoMind AI
 *
 * This service is the integration point for AI vision models.
 * It uses Google Gemini (via @google/genai) or OpenAI based on the provided API key.
 * If no key is provided, it falls back to DEMO mode.
 */

import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface AIAnalysisResult {
  objectName: string;
  material: string;
  materialCode?: string;
  condition: 'clean' | 'good' | 'slightly_contaminated' | 'contaminated' | 'heavily_contaminated' | 'damaged' | 'used' | 'mixed_material';
  contaminationLevel: 'none' | 'low' | 'medium' | 'high';
  contaminationPercentage: number;
  reusability: 'reusable' | 'reusable_after_preparation' | 'not_suitable';
  recyclingStatus: 'recyclable' | 'recyclable_after_preparation' | 'facility_dependent' | 'not_suitable' | 'special_handling';
  isOrganic: boolean;
  isHazardous: boolean;
  confidence: number;
  rawDescription?: string;
}

const VISION_PROMPT = `You are EcoMind AI, an expert waste identification and recycling intelligence system.
Your task is to analyze the provided image and identify the primary waste object visible. 

CRITICAL INSTRUCTIONS:
1. Identify the MAIN/FOREGROUND waste item only. Ignore background noise.
2. DO NOT hallucinate or guess randomly. If the image is unclear, blurry, or no waste object is visible, set "objectName" strictly to "Unknown / Unable to identify confidently".
3. Provide the result strictly in JSON format.

The JSON must exactly match this structure:
{
  "objectName": "string (e.g. 'Plastic Water Bottle', or 'Unknown / Unable to identify confidently')",
  "material": "string (e.g. 'Plastic', 'Glass', 'Paper/Cardboard', 'Metal', 'Organic', 'E-waste', 'Other')",
  "materialCode": "string (e.g. 'PET (#1)' - optional, omit if unknown)",
  "condition": "string (one of: 'clean', 'good', 'slightly_contaminated', 'contaminated', 'heavily_contaminated', 'damaged', 'used', 'mixed_material')",
  "contaminationLevel": "string (one of: 'none', 'low', 'medium', 'high')",
  "contaminationPercentage": "number (0-100, representing percentage of contamination)",
  "reusability": "string (one of: 'reusable', 'reusable_after_preparation', 'not_suitable')",
  "recyclingStatus": "string (one of: 'recyclable', 'recyclable_after_preparation', 'facility_dependent', 'not_suitable', 'special_handling')",
  "isOrganic": boolean,
  "isHazardous": boolean,
  "confidence": number (0-100)
}
Return ONLY valid JSON.`;

// ─── Real AI Integration Hooks ──────────────────────────────────────────────

async function analyzeWithGemini(imagePath: string, apiKey: string): Promise<AIAnalysisResult> {
  const ai = new GoogleGenAI({ apiKey });
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  
  // Need mime type
  const ext = imagePath.split('.').pop()?.toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === 'png') mimeType = 'image/png';
  if (ext === 'webp') mimeType = 'image/webp';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      VISION_PROMPT,
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      }
    ],
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from Gemini");
  return JSON.parse(text) as AIAnalysisResult;
}

async function analyzeWithOpenAI(imagePath: string, apiKey: string): Promise<AIAnalysisResult> {
  const openai = new OpenAI({ apiKey });
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  
  const ext = imagePath.split('.').pop()?.toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === 'png') mimeType = 'image/png';
  if (ext === 'webp') mimeType = 'image/webp';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: "json_object" },
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: VISION_PROMPT },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
      ]
    }],
    max_tokens: 500,
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content returned from OpenAI");
  return JSON.parse(content) as AIAnalysisResult;
}

// ─── Demo Samples (Fallback) ──────────────────────────────────────────────────
const DEMO_SAMPLES: AIAnalysisResult[] = [
  {
    objectName: 'Plastic Bottle',
    material: 'Plastic',
    materialCode: 'PET (#1)',
    condition: 'slightly_contaminated',
    contaminationLevel: 'low',
    contaminationPercentage: 15,
    reusability: 'reusable_after_preparation',
    recyclingStatus: 'recyclable_after_preparation',
    isOrganic: false,
    isHazardous: false,
    confidence: 92,
  },
  {
    objectName: 'Glass Jar',
    material: 'Glass',
    materialCode: 'Type I Soda-Lime',
    condition: 'good',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'reusable',
    recyclingStatus: 'recyclable',
    isOrganic: false,
    isHazardous: false,
    confidence: 95,
  },
  {
    objectName: 'Cardboard Box',
    material: 'Paper/Cardboard',
    materialCode: 'Corrugated Cardboard',
    condition: 'clean',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'reusable',
    recyclingStatus: 'recyclable',
    isOrganic: false,
    isHazardous: false,
    confidence: 94,
  },
  {
    objectName: 'Cardboard Food Box',
    material: 'Paper/Cardboard',
    materialCode: 'Coated Cardboard',
    condition: 'heavily_contaminated',
    contaminationLevel: 'high',
    contaminationPercentage: 85,
    reusability: 'not_suitable',
    recyclingStatus: 'facility_dependent',
    isOrganic: false,
    isHazardous: false,
    confidence: 88,
  },
  {
    objectName: 'Battery',
    material: 'Battery / Mixed Materials',
    materialCode: 'Alkaline / Li-ion',
    condition: 'used',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'not_suitable',
    recyclingStatus: 'special_handling',
    isOrganic: false,
    isHazardous: true,
    confidence: 90,
  },
  {
    objectName: 'Aluminium Can',
    material: 'Metal',
    materialCode: 'Aluminium',
    condition: 'clean',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'not_suitable',
    recyclingStatus: 'recyclable',
    isOrganic: false,
    isHazardous: false,
    confidence: 93,
  },
  {
    objectName: 'Plastic Bag',
    material: 'Plastic',
    materialCode: 'LDPE (#4)',
    condition: 'contaminated',
    contaminationLevel: 'medium',
    contaminationPercentage: 45,
    reusability: 'not_suitable',
    recyclingStatus: 'facility_dependent',
    isOrganic: false,
    isHazardous: false,
    confidence: 82,
  },
  {
    objectName: 'Food Scraps',
    material: 'Organic',
    materialCode: 'Biodegradable',
    condition: 'clean',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'not_suitable',
    recyclingStatus: 'not_suitable',
    isOrganic: true,
    isHazardous: false,
    confidence: 87,
  },
  {
    objectName: 'Mobile Phone',
    material: 'E-waste',
    materialCode: 'Mixed Electronics',
    condition: 'damaged',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'not_suitable',
    recyclingStatus: 'special_handling',
    isOrganic: false,
    isHazardous: true,
    confidence: 89,
  },
  {
    objectName: 'Newspaper',
    material: 'Paper/Cardboard',
    materialCode: 'Newsprint',
    condition: 'clean',
    contaminationLevel: 'none',
    contaminationPercentage: 0,
    reusability: 'reusable_after_preparation',
    recyclingStatus: 'recyclable',
    isOrganic: false,
    isHazardous: false,
    confidence: 91,
  },
];

function selectDemoSample(imagePath: string): AIAnalysisResult {
  const stat = fs.statSync(imagePath);
  const index = stat.size % DEMO_SAMPLES.length;
  return { ...DEMO_SAMPLES[index] };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function analyzeWaste(imagePath: string): Promise<AIAnalysisResult & { isDemo: boolean }> {
  const geminiKey = process.env.GOOGLE_VISION_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      console.log('[aiService] Using Gemini API for Vision Analysis...');
      const result = await analyzeWithGemini(imagePath, geminiKey);
      return { ...result, isDemo: false };
    } catch (err: any) {
      console.error('[aiService] Gemini API failed:', err);
      throw new Error(`Gemini Vision API Error: ${err.message}`);
    }
  } else if (openaiKey) {
    try {
      console.log('[aiService] Using OpenAI API for Vision Analysis...');
      const result = await analyzeWithOpenAI(imagePath, openaiKey);
      return { ...result, isDemo: false };
    } catch (err: any) {
      console.error('[aiService] OpenAI API failed:', err);
      throw new Error(`OpenAI Vision API Error: ${err.message}`);
    }
  }

  // Demo mode fallback only if NO keys are provided
  console.log('[aiService] No valid API keys found. Using Demo Mode.');
  const demo = selectDemoSample(imagePath);
  return { ...demo, isDemo: true };
}

export { DEMO_SAMPLES };

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface EnvironmentalAnalysis {
  algaeGrowth: {
    present: boolean;
    severity: "None" | "Low" | "Medium" | "High";
    details: string;
  };
  sedimentDeposits: {
    present: boolean;
    severity: "None" | "Low" | "Medium" | "High";
    details: string;
  };
  erosionDamage: {
    present: boolean;
    severity: "None" | "Low" | "Medium" | "High";
    details: string;
  };
  wildlifeHabitatRisk: {
    present: boolean;
    severity: "None" | "Low" | "Medium" | "High";
    details: string;
  };
  overallRiskAssessment: "Low" | "Medium" | "High";
  summary: string;
}

export async function analyzeImages(images: { data: string, mimeType: string }[]): Promise<EnvironmentalAnalysis> {
  const prompt = `Analyze these outdoor environment images carefully. I need you to assess them for the following four specific environmental factors:
1. Harmful algae growth (look at water bodies, discoloration, etc.)
2. Sediment deposits (look for unusual silting, soil buildup near water or land changes)
3. Erosion damage (look for exposed roots, crumbling banks, gullies, or washed-out soil)
4. Wildlife habitat risk and effects (look for habitat destruction, pollution impacting wildlife, or changes that threaten local fauna)

Provide a detailed assessment for each of these four factors, including whether they are present, their severity, and details about what you see across the provided images. Also provide an overall environmental risk assessment (Low, Medium, or High) based on these factors, and a brief summary of the environment.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      algaeGrowth: {
        type: Type.OBJECT,
        properties: {
          present: { type: Type.BOOLEAN },
          severity: { type: Type.STRING, description: "Must be 'None', 'Low', 'Medium', or 'High'" },
          details: { type: Type.STRING, description: "Detailed observations about algae growth" }
        },
        required: ["present", "severity", "details"]
      },
      sedimentDeposits: {
        type: Type.OBJECT,
        properties: {
          present: { type: Type.BOOLEAN },
          severity: { type: Type.STRING, description: "Must be 'None', 'Low', 'Medium', or 'High'" },
          details: { type: Type.STRING, description: "Detailed observations about sediment deposits" }
        },
        required: ["present", "severity", "details"]
      },
      erosionDamage: {
        type: Type.OBJECT,
        properties: {
          present: { type: Type.BOOLEAN },
          severity: { type: Type.STRING, description: "Must be 'None', 'Low', 'Medium', or 'High'" },
          details: { type: Type.STRING, description: "Detailed observations about erosion damage" }
        },
        required: ["present", "severity", "details"]
      },
      wildlifeHabitatRisk: {
        type: Type.OBJECT,
        properties: {
          present: { type: Type.BOOLEAN },
          severity: { type: Type.STRING, description: "Must be 'None', 'Low', 'Medium', or 'High'" },
          details: { type: Type.STRING, description: "Detailed observations about wildlife habitat risk and effects" }
        },
        required: ["present", "severity", "details"]
      },
      overallRiskAssessment: {
        type: Type.STRING,
        description: "Must be 'Low', 'Medium', or 'High'"
      },
      summary: {
        type: Type.STRING,
        description: "A brief 2-3 sentence summary of the environmental state based on the images"
      }
    },
    required: ["algaeGrowth", "sedimentDeposits", "erosionDamage", "wildlifeHabitatRisk", "overallRiskAssessment", "summary"]
  };

  const imageParts: any[] = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini API");
  }

  return JSON.parse(text) as EnvironmentalAnalysis;
}

import { GoogleGenerativeAI } from "@google/generative-ai";

// וודא שה-API KEY מוגדר בקובץ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeFoodSafety = async (userProfile, productData) => {
  try {
    // 1. זיהוי סוג הקלט
    const isCart = Array.isArray(productData);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    // 2. בניית תיאור המידע
    let dataDescription = "";
    if (isCart) {
      dataDescription = `Shopping Cart List: [${productData.join(', ')}]`;
    } else {
      dataDescription = `Single Product: "${productData.name}" (Brand: "${productData.brand || 'General'}")`;
    }

    // --- הוספת נתוני גוף (BMI & WHtR) ---
    const bmi = userProfile.bmi || (userProfile.bodyMeasurements && userProfile.bodyMeasurements.bmi) || 'Unknown';
    const whtr = userProfile.whtr || (userProfile.bodyMeasurements && userProfile.bodyMeasurements.whtr) || 'Unknown';

    // 3. בניית הפרומפט
    const prompt = `
      You are an expert clinical nutritionist AI agent.
      
      User Profile (INTERNAL USE ONLY - DO NOT REVEAL IN OUTPUT):
      - Age: ${userProfile.ageYears || userProfile.age || 'Unknown'}
      - BMI: ${bmi}
      - Waist-to-Height Ratio (WHtR): ${whtr}
      - Medical Conditions: ${userProfile.illnesses ? userProfile.illnesses.join(', ') : 'None'}
      - Other notes: ${userProfile.otherIllnesses || 'None'}
      
      Data to Analyze:
      ${dataDescription}
      
      Instructions:
      1. Identify the food item(s) based on general knowledge.
      2. Check suitability against the user's specific medical conditions AND body measurements.
      
      3. **NUANCED APPROACH WITH STRICT SAFETY GUARDRAILS (Crucial):**
         
         A. **The "Soft" Rule (General Wellness):** - If a product is slightly imperfect (e.g., moderate processing/sugar/fat) BUT the user has a healthy BMI/WHtR and NO conflicting illnesses, lean towards "SAFE".
            - Do not be overly alarmist about general processed food for a healthy person.

         B. **The "Hard" Safety Limit (NO COMPROMISE):**
            - **STOP!** If the product contains ingredients that directly contradict a specific medical condition (e.g., Sugar for Diabetes, Sodium for Hypertension, Gluten for Celiac), you MUST mark it as "CAUTION" or "AVOID".
            - This applies **EVEN IF** the user has a perfect BMI.
            - **Do not allow** any flexibility if consumption could worsen the specific condition or lead to health deterioration.
            - Priority: Preventing exacerbation of illness > Dietary flexibility.
      
      ⚠️ IMPORTANT PRIVACY & SAFETY RULES:
      1. **NEVER** explicitly mention the name of the medical diagnosis (e.g., do NOT say "Because of your Diabetes" or "Due to Hypertension").
      2. Instead, use generic phrases like "your health condition", "your specific profile", or "your dietary needs".
      3. Focus the explanation on the *nutrients* (e.g., "High sugar content is not recommended for your profile").
      4. Return RAW JSON only. Do NOT wrap in markdown code blocks.

      ${isCart ? `
      **MODE: CART ANALYSIS (Multiple Items)**
      - Analyze EVERY item in the list separately.
      - Calculate a "healthMatchScore" (0-100) representing how well the WHOLE cart fits the user's health needs (100 = Perfect, 0 = Bad).
      
      Output JSON Schema:
      {
        "healthMatchScore": number,
        "analyzedItems": [
          { 
            "productName": "string", 
            "allowed": boolean, 
            "recommendation": "SAFE" | "CAUTION" | "AVOID", 
            "reason": "Short explanation (max 10 words) referring to nutrients/profile ONLY (no disease names)." 
          }
        ]
      }
      ` : `
      **MODE: SINGLE PRODUCT ANALYSIS**
      - Analyze the safety of this specific product.
      - Suggest up to 5 healthier alternatives that are similar to this product but better suited for the user's condition.
      
      Output JSON Schema:
      {
        "allowed": boolean,
        "recommendation": "SAFE" | "CAUTION" | "AVOID",
        "reason": "Short explanation addressing the user directly without naming the disease.",
        "alternatives": [
          {
            "name": "Name of healthier product",
            "reason": "Why is it better for the user's profile?"
          }
        ]
      }
      `}
    `;

    // 4. שליחה ל-Gemini
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // ניקוי סימני Markdown לפני ה-Parse
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Gemini Agent Error:", error);
    
    // מנגנון Fallback
    if (Array.isArray(productData)) {
        return { healthMatchScore: 0, analyzedItems: [] };
    }
    return {
        allowed: false,
        recommendation: "CAUTION",
        reason: "AI Service unavailable. Please check ingredients manually.",
        alternatives: []
    };
  }
};
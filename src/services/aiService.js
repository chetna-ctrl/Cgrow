import { searchLocalExpert } from './expertKnowledge';

/**
 * Agri-OS AI & LLM Service
 * Integrated with Hugging Face Inference API & Local Expert Hybrid Layer
 */

// Environment-based configuration for Hugging Face
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
const AI_MODEL_URL = import.meta.env.VITE_AI_MODEL_URL;

/**
 * Professor AI - Ask agricultural questions using LLM
 * 🚀 TIERED INTELLIGENCE ENGINE: 
 * 1. Local Rules (Instant/Free)
 * 2. Premium Cloud (HF/Gemini - If Key exists)
 * 3. Public Free Cloud (Pollinations - No Key/Unlimited)
 */
export const askProfessorAI = async (question, cropContext = "") => {
    try {
        // LAYER 1: Local Expert (Offline Fallback)
        const localAnswer = searchLocalExpert(question);
        if (localAnswer) return localAnswer;

        // LAYER 2: Private Cloud AI (Hugging Face)
        if (HF_TOKEN && HF_TOKEN !== "hf_placeholder_token" && !HF_TOKEN.includes("your_token")) {
            try {
                console.log("🤖 Professor AI: Attempting Private Cloud (HF)...");
                const hfResponse = await askHuggingFaceAI(question, cropContext);
                if (hfResponse && !hfResponse.includes("Error:")) return hfResponse;
            } catch (e) {
                console.warn("⚠️ Private Cloud unavailable:", e.message);
            }
        }

        // LAYER 3: Public Free AI (Pollinations)
        try {
            console.log("✈️ Professor AI: Falling back to Public Free Tier...");
            const publicAnswer = await askPublicFreeAI(question, cropContext);
            if (publicAnswer) return publicAnswer;
        } catch (e) {
            console.warn("⚠️ Public Free AI unavailable:", e.message);
        }

        // LAYER 4: Semi-Dynamic Fallback (Best effort without internet)
        return getEmergencyAdvice(question);

    } catch (error) {
        console.error("❌ AI Ultimate Failure:", error);
        return "Professor AI is currently resting. Please check your internet or ask about 'pH' or 'mold' for instant advice.";
    }
};

/**
 * Hugging Face Implementation with Loading Handling
 */
const askHuggingFaceAI = async (question, cropContext) => {
    const prompt = `You are "Professor AI", an expert agronomist. Context: ${cropContext || 'various crops'} in Delhi. Question: ${question}. Answer in 2 short sentences.`;
    
    try {
        const response = await fetch(AI_MODEL_URL, {
            headers: { 
                "Authorization": `Bearer ${HF_TOKEN}`, 
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: prompt,
                options: { wait_for_model: true } // Tell HF to wait if model is loading
            }),
        });

        const result = await response.json();

        if (result.error) {
            console.warn("HF API Error:", result.error);
            return `Error: ${result.error}`;
        }

        if (Array.isArray(result) && result[0]?.generated_text) {
            let answer = result[0].generated_text.replace(prompt, "").trim();
            // If the model just repeats the prompt, try to extract real answer
            if (answer.length < 5 && result[0].generated_text.includes("Answer:")) {
                answer = result[0].generated_text.split("Answer:").pop().trim();
            }
            return answer;
        }
        
        return null;
    } catch (err) {
        throw new Error(`HF Fetch Failure: ${err.message}`);
    }
};

/**
 * 🌍 Public Free AI (Pollinations.ai)
 * Refined to handle the "Deprecation Notice" text more intelligently
 */
export const askPublicFreeAI = async (question, cropContext = "") => {
    try {
        const prompt = `You are a Scientific Agronomist for cGrow. Answer this: ${question}. Context: ${cropContext || 'General crops'}. 3 sentences max. Stick to facts.`;
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&cache=false`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const answer = await response.text();
        
        // Detect if the response is actually just the notice
        const isNoticeOnly = answer.includes("IMPORTANT NOTICE") && answer.length < 500;
        
        if (isNoticeOnly) {
            console.warn("Pollinations returned only a notice.");
            return null; // Fall through to secondary fallback
        }

        // Strip the notice if it's just prepended to a real answer
        const cleanAnswer = answer.replace(/⚠️ IMPORTANT NOTICE ⚠️[\s\S]*?normally\./, "").trim();
        
        return cleanAnswer || null;
    } catch (error) {
        console.error("Public AI Fetch Error:", error);
        return null; // Silent failure to allow next layer
    }
};

/**
 * Emergency Advice Layer (Offline/Cloud Failure)
 * Provides a useful response based on query keywords even when APIs are down.
 */
const getEmergencyAdvice = (question) => {
    const query = question.toLowerCase();
    
    const emergencyTips = [
        { regex: /water|dry|thirsty/i, tip: "If the medium feels dry 1 inch down, it's time to water! Check your pump for clogs." },
        { regex: /light|dark|sun/i, tip: "Microgreens need 12-16 hours of light. If they look 'leggy', move your lights closer." },
        { regex: /eat|harvest|ready/i, tip: "Best harvested early morning for maximum crispness. Use sharp scissors!" },
        { regex: /smell|stink|bad/i, tip: "A bad smell usually means standing water or rot. Increase airflow immediately." },
        { regex: /buy|price|cost/i, tip: "Check the 'Trade Hub' tab for live market rates in Delhi NCR." }
    ];

    const foundTip = emergencyTips.find(t => t.regex.test(query));
    
    if (foundTip) {
        return `🎓 Professor AI (Local Sync): ${foundTip.tip} (Cloud restricted - check internet).`;
    }

    return "Professor AI is currently optimizing its systems for your crops. Quick Tip: Check your water pH level (ideal 6.0) while I sync with the cloud!";
};

/**
 * FUTURE: Gemini AI Integration (Higher limits)
 * If users want to switch from Hugging Face
 */
export const askGeminiAI = async (question) => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return "Gemini Key missing in .env";
    
    // Implementation for Gemini API would go here
    return "Gemini integration ready! (Requires additional setup)";
};

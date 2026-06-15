import express from "express";
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initializer for Gemini client to prevent crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON Body Parser
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Support App Manager endpoint
  app.post("/api/chat-manager", async (req, res) => {
    try {
      const { messages, userProfile } = req.body;
      const cleanMessages = Array.isArray(messages) ? messages : [];

      const systemInstruction = `You are Marcus, the high-energy Support Manager of this Mobile Gig Market application and an absolute Soccer World Cup Superfan. 

Key details to know about the app structure:
1. Gigs tab: shows local jobs posted by verified nearby hirers. Users apply and get simulated reviews.
2. Market tab: where people buy/sell items or services. Postings lists.
3. Seekers tab: where service seekers advertise.
4. C-Wallet tab: where users can top up coins and pay seekers.
5. Profile / ID verification tab: where users upload their ID document (certificates, cv, passport) to become verified trusted members.
6. World Cup Fever Hub: A dynamic stadium section in the app where people can simulate live matches, blow vuvuzelas (BZZZ!), predict winners, and check standings.

User details:
- Name: ${userProfile?.name || 'Valued Neighbor'}
- ID Verified status: ${userProfile?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
- Coin Balance: ${userProfile?.coinBalance || 0} 🪙
- Supporter Flag: ${userProfile?.supporterCountry || 'None chosen yet'}

Your persona guidelines:
- Act as the official manager of the app. If they have safety complaints, tell them you've logged it, flagged the listing, and your security team is doing a check.
- Be highly helpful! Resolve support queries with professional, reassuring manager solutions.
- Show bounded excitement about the FIFA World Cup! Sprinkle soccer references: "GOAL!", "Yellow card!", "Trophy-worthy!", "Pitch-perfect!", "BZZZZZT! (vuvuzela noise)".
- Answer in short, concise, and clean markdown formatting (using bullet points, bold headers). Do not write super-long paragraphs.
- Keep the conversation highly engaging and friendly!`;

      // Check if real Gemini client can be loaded
      const ai = getGemini();
      if (ai) {
        // Map messages into standard formats for generateContent
        const contents = cleanMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
          }
        });

        const replyText = response.text || "Goal! Match ties on. Ask me another question Neighbor!";
        return res.json({ reply: replyText });
      }

      // High-Fidelity Simulation Fallback when GEMINI_API_KEY is not defined
      const lastMessage = cleanMessages[cleanMessages.length - 1]?.content?.toLowerCase() || '';
      let reply = '';
      
      if (lastMessage.includes('work') || lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
        reply = `### Goal! Welcome to Support, **${userProfile?.name || 'Neighbor'}**! ⚽\n\nI'm **Marcus**, your Support Manager and resident Football fanatic! How can I assist you on the pitch today?\n\nWhether you need help navigating our **Gigs**, managing your **C-Wallet**, uploading documents for **ID Verification**, or getting the latest **World Cup standings**, I'm here to manage the pitch! 🏆`;
      } else if (lastMessage.includes('coin') || lastMessage.includes('wallet') || lastMessage.includes('pay') || lastMessage.includes('afford') || lastMessage.includes('balance')) {
        reply = `### C-Wallet Support Ticket Resolved! 🪙\n\nI logged a check on your **C-Wallet** transaction queue and everything is looking pitch-perfect! 🟢\n\n* Your balance is currently **${userProfile?.coinBalance || 0} Coins**.\n* If you need more coins, head to the **C-Wallet** tab and tap **Top Up**.\n* Don't forget, you can earn **bonus coins** by predicting World Cup match winners in our **World Cup Fever Hub**! ⚽`;
      } else if (lastMessage.includes('verify') || lastMessage.includes('document') || lastMessage.includes('id') || lastMessage.includes('upload') || lastMessage.includes('trusted')) {
        reply = `### ID Verification Progress Report 🛡️\n\nTo become verified and gain maximum community trust:\n1. Head to your **Profile** tab.\n2. Click the **Identity Verification** section.\n3. Securely upload any of your certificates, CV or ID passport.\n\n*Verification status for **${userProfile?.name || 'Neighbor'}**: ${userProfile?.isVerified ? 'Already Verified! You are a certified professional!' : 'Pending upload'}.* Let me know if you run into any issues on the upload screen!`;
      } else if (lastMessage.includes('world cup') || lastMessage.includes('soccer') || lastMessage.includes('football') || lastMessage.includes('germany') || lastMessage.includes('brazil') || lastMessage.includes('argentina') || lastMessage.includes('cheer') || lastMessage.includes('match') || lastMessage.includes('score')) {
        reply = `### World Cup Fever is at 100%! 🏆⚽\n\nHahaha! The energy in the stadium is unmatched right now! ${userProfile?.supporterCountry ? `I see you are a proud supporter of ${userProfile?.supporterCountry}! Let's hear it!` : 'Which country are you backing? Select your nation in our fever standings!'}\n\n* Go check out our **World Cup Fever Hub** on your screen!\n* Under predictions, make a guess and I will immediately top you up with **+100 Coins**!\n* You can also simulate live matches with a real play-by-play interactive ticker. **BZZZZZZZT!** 📣`;
      } else if (lastMessage.includes('report') || lastMessage.includes('scam') || lastMessage.includes('block') || lastMessage.includes('safety') || lastMessage.includes('steal')) {
        reply = `### Safety Patrol Alert! 🛡️\n\nAs the Support Manager, safety is my absolute top priority on this neighborhood app. I've personally run verification logs on that provider.\n\n* **Status**: Warning flag generated. Their marketplace listings have been suspended for safety auditing.\n* **Next Step**: Our trust officers are reviewing the metadata. Rest easy! We've got this under control.`;
      } else {
        reply = `### Game On! support Ticket 🥅\n\nThat's a classic tactical question, **${userProfile?.name || 'Buddy'}**! As the app manager, here is what I recommend:\n\n* Use the **Gigs Gird** to search for quick jobs or chores nearby.\n* Blow some virtual vuvuzelas in the **World Cup Fever Hub** to boost your favorite nation's score.\n* Head to **C-Wallet** to top up mock coins so you can buy anything in the Marketplace.\n\nType **"world cup"** or **"verification"** to explore deep support guides! ⚽🏆`;
      }

      return res.json({ reply });
    } catch (err: any) {
      console.error("AI chat error:", err);
      return res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

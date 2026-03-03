import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import ssl

# Global patch to bypass SSL verification for legacy apiai service (api.api.ai)
# This is necessary because the legacy domain has expired/mismatched certificates
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    # Legacy Python that doesn't verify HTTPS by default
    pass
else:
    # Handle target environment that does verify HTTPS
    ssl._create_default_https_context = _create_unverified_https_context

# Add gideon-ai to path as the FIRST priority
sys.path.insert(0, os.path.join(os.getcwd(), "gideon-ai"))

try:
    from gideonai.RequestControl import RequestController
    from gideonai.KnowledgeControl import KnowledgeController
except ImportError as e:
    print(f"Error importing gideonai: {e}")
    sys.exit(1)

app = FastAPI(title="Gideon-AI Bridge")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your intranet domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    text: str

class Response(BaseModel):
    reply: str
    action: str = "none"

# Initialize Gideon parts
request_handler = RequestController()
knowledge_handler = KnowledgeController()

@app.get("/status")
async def get_status():
    return {"status": "online", "name": "Gideon", "version": "1.0.0"}

@app.post("/ask", response_model=Response)
async def ask_gideon(query: Query):
    if not query.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        # Get response from Dialogflow (old apiai)
        output = request_handler.handle_request(query.text)
        
        reply = ""
        action = "none"
        
        if output and 'result' in output:
            reply = output['result']['fulfillment'].get('speech', '')
            action = output['result'].get('action', 'none')
            
            # If no speech response, check actions (like weather/wisdom)
            if not reply:
                if 'weather' in action:
                    reply = knowledge_handler.getWeather(output['result'])
                elif 'wisdom' in action:
                    reply = knowledge_handler.ask(output['result'])
                else:
                    reply = "I'm not sure how to help with that yet, but I'm learning!"
        
        if not reply:
            reply = "I heard you, but my neural core is a bit foggy right now."
            
        return Response(reply=reply, action=action)
    except Exception as e:
        print(f"Error processing request: {e}")
        return Response(reply="Oops! Something went wrong in my brain.", action="error")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

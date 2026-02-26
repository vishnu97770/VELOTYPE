from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CRUCIAL: Allow your React app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5178"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"The backend is alive."}
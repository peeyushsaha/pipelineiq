from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

from routes.fetch_logs import router as fetch_logs_router
from routes.analyze import router as analyze_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(name)s - %(message)s")

load_dotenv()

app = FastAPI(title="PipelineIQ API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(fetch_logs_router)
app.include_router(analyze_router)


@app.get("/")
async def root():
    return {"message": "PipelineIQ API is running"}

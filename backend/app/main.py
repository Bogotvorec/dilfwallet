from fastapi import FastAPI
from app.routes_auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "DILFwallet backend running!"}

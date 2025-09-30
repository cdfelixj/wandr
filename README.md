# Wandr

AI-powered travel assistant that converts natural language input into optimized multi-stop routes.

## Overview

Wandr processes voice and text input to generate intelligent travel routes, eliminating the need for manual navigation app interactions. The system handles complex multi-destination requests, provides area intelligence, and optimizes routes based on real-time constraints.

## Purpose

Traditional navigation apps require structured input and manual route planning. Wandr addresses this by:
- Converting unstructured speech/text into actionable route plans
- Reducing driver distraction through hands-free operation
- Providing contextual area information and recommendations
- Optimizing multi-stop routes automatically

## Core Features

- **Natural Language Processing**: Voice and text input with intent parsing
- **Multi-destination Routing**: Automated route optimization with constraints
- **Area Intelligence**: Location analysis with business data and recommendations  
- **Voice-first Interface**: Hands-free operation with speech recognition
- **Personalization**: User preference learning and saved locations

## Tech Stack

### Frontend
- Next.js 15 with React and TypeScript
- Tailwind CSS for styling
- Mapbox GL JS for mapping
- React Query for state management
- Web Speech API for voice input

### Backend
- FastAPI with Python 3.11
- Pydantic for data validation
- LangGraph for AI workflow orchestration
- MongoDB for data persistence

### AI/ML Services
- OpenAI Whisper for speech transcription
- Google Gemini for intent parsing
- OpenAI GPT for area summaries
- Google Places and Directions APIs
- Cohere for content analysis

### Infrastructure
- Docker containerization
- Nginx reverse proxy
- Redis for caching


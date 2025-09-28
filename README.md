<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<img width="1440" height="777" alt="wandr" src="https://github.com/user-attachments/assets/8517a75c-d8ae-4f77-82e2-089afbfe2406" />

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1 align="center">Wandr</h1>

  <p align="center">
    AI voice assistant for your everyday travels  
    <br />
    <a href="https://youtu.be/BBaWlYHI5M0" target="_blank"><strong>View Demo »</strong></a>
    <br />
  </p>
</div>

---

## 📖 About The Project

Wandr is a smart, hands-free travel assistant that turns navigation into a conversation.  
Instead of manually typing and juggling multiple apps, users can simply **talk or text** their plans.  
Wandr processes natural language, understands complex multi-stop requests, and builds optimized routes—making travel both **safer** and **more enjoyable**.

### Inspiration
Navigation apps today aren't built for how humans actually communicate. Drivers are forced into rigid commands, creating unsafe distractions. We imagined: *what if trip planning was as natural as talking to a friend who knows the area?*  

That idea became Wandr.

---

## ✨ Features

- **Smart Map & Route Planning**  
  Context-aware intent parsing using Google Gemini. Handles multi-destination requests.
- **Voice-First Navigation**  
  Hands-free control with OpenAI Whisper transcription + natural language processing.
- **Unstructured Data Processing**  
  Converts messy or incomplete speech into structured navigation data. Confidence scoring & fallback mechanisms ensure reliability.
- **Intelligent Route Optimization**  
  Real-time constraints (time, distance, preferences). Integration with Google Directions API.
- **Sidequest Mode**  
  Generates spontaneous activity-based routes based on mood, budget, and interests.
- **Personalized Experience**  
  Learns from behavior patterns, saves places like *Home, Work, Gym*, and adapts over time.

---

## 🛠️ How We Built It

Wandr is a **modern full-stack AI application** powered by a multi-stage processing pipeline.

### Frontend
- **Next.js 15**, **React**, **TypeScript**
- **Tailwind CSS** for styling
- **Mapbox GL JS** for interactive maps
- **React Query** for server state
- **Web Speech API** for browser-based voice input

### Backend
- **FastAPI** with Python 3.11
- **Pydantic** for validation
- **LangGraph** for orchestrating AI workflows
- **Uvicorn** for async performance

### External AI & APIs
- **OpenAI Whisper** → voice transcription  
- **Google Gemini** → natural language intent parsing  
- **Google Places & Directions APIs** → business info + routing  
- **Cohere** → trendiness scoring and multimodal analysis  

### Infrastructure
- **Docker** for containerization
- **Nginx** reverse proxy
- **MongoDB** for user data & preferences
- **Redis** for caching & session management
- **Kubernetes** for scalability (future-ready)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/wandr.git
cd wandr

# Start development environment
./dev-start.bat
```

### Manual Setup
1. **Backend Setup**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📱 Usage

1. **Voice Input**: Click the microphone and speak naturally
   - *"I need to get groceries and pick up dry cleaning before 5 PM"*
   - *"Find me a good coffee shop near downtown"*

2. **Text Input**: Type your travel plans in natural language

3. **Route Optimization**: Let Wandr handle the complex routing logic

4. **Sidequest Discovery**: Explore spontaneous activities based on your preferences

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

Project Link: [https://github.com/your-username/wandr](https://github.com/your-username/wandr)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
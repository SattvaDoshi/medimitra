@echo off
echo Installing MediMitra Voice Assistant Backend (Windows)
echo =====================================================

echo.
echo Step 1: Installing core dependencies...
pip install fastapi uvicorn[standard] python-multipart pydantic websockets

echo.
echo Step 2: Installing AI and voice dependencies...
pip install google-generativeai speechrecognition python-dotenv gtts playsound==1.2.2

echo.
echo Step 3: Installing utility libraries...
pip install aiofiles requests numpy

echo.
echo Step 4: Installing development dependencies...
pip install pytest httpx

echo.
echo ============================================
echo Installation completed!
echo ============================================
echo.
echo Optional: To enable advanced voice features, you can manually install:
echo   - PyAudio: pip install pyaudio (may require Visual C++)
echo   - WebRTC VAD: pip install webrtcvad (requires Visual C++)
echo.
echo Alternative for PyAudio on Windows:
echo   1. Download PyAudio wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio
echo   2. Install using: pip install downloaded_wheel.whl
echo.
echo To start the server: python main.py
echo.
pause
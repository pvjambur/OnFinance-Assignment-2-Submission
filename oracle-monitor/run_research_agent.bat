@echo off
echo Starting Research Agent...
echo.
echo This agent will emit logs every ~5 seconds with detailed 6-phase cycles:
echo   1. Initiating research
echo   2. Collecting metrics
echo   3. Running analysis
echo   4. Results
echo   5. Recommendations
echo   6. Completion
echo.
echo Logs will appear in the frontend at http://localhost:5173
echo Press Ctrl+C to stop
echo.

python -m agents.research_agent.main

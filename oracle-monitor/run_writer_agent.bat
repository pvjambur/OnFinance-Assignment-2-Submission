@echo off
echo Starting Writer Agent...
echo.
echo This agent will emit logs every ~6 seconds with report generation phases:
echo   1. Starting report
echo   2. Fetching data
echo   3. Processing
echo   4. Writing sections
echo   5. Quality validation
echo   6. Report saved
echo.
echo Logs will appear in the frontend at http://localhost:5173
echo Press Ctrl+C to stop
echo.

python -m agents.writer_agent.main

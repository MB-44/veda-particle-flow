@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM === Generate unique log file (log001.txt, log002.txt, etc.) ===
set /a logNum=1
:findLogName
set "logFile=log00%logNum%.txt"
if exist "!logFile!" (
    set /a logNum+=1
    if !logNum! LSS 10 goto findLogName
    set "logFile=log0!logNum!.txt"
    if exist "!logFile!" (
        set /a logNum+=1
        goto findLogName
    )
)

echo Logging to: !logFile!

REM === Start renaming process ===
set /a count=1
(for /f "delims=" %%f in ('dir /b /a:-d ^| sort') do (
    if /I not "%%f"=="File Renamer.bat" if /I not "%%f"=="!logFile!" (
        set "ext=%%~xf"
        echo %%f|findstr /v /i /c:"!logFile!" >nul
        echo %%f;!count!!ext!>>"!logFile!"
        ren "%%f" "!count!!ext!"
        set /a count+=1
    )
))

echo.
echo Uber cariya uttoo!!
echo.

REM === Undo prompt ===
set /p undo=Do you want to undo the rename? (Y/N): 
if /I "%undo%"=="Y" (
    echo Undoing changes...
    for /f "tokens=1,2 delims=;" %%a in (!logFile!) do (
        ren "%%b" "%%a"
    )
    echo Files restored!
)

pause

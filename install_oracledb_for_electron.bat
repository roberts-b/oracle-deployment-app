
ECHO Starting installation of oracledb driver
set CURRENT_DIR=%CD%
echo Current dir: %CURRENT_DIR%

set OCI_LIB_DIR=%CURRENT_DIR%\instantclient\sdk\lib\msvc
set OCI_INC_DIR=%CURRENT_DIR%\instantclient\sdk\include

call npm i oracledb --save

echo OracleDB installed and compiled for current Node version
set /P INPUT="Do you want to rebuild OracleDb for electron 1.7.8 ?(Y/N)"
If /I "%INPUT%"=="y" goto yes 
If /I "%INPUT%"=="n" goto no
:yes
echo Received Y so going to oracledb dir and launching recompilation
cd %CURRENT_DIR%\node_modules\oracledb

call %CURRENT_DIR%\node_modules\.bin\node-gyp rebuild --target=1.7.8 --arch=x64 --target_platform=win --dist-url=http://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist --msvs_version=2013

cd %CURRENT_DIR%
echo OracleDB recompiled for electron version 1.7.8

:no
echo Script completed exiting !
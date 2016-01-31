# Mitsubishi-SCADA
SCADA system for Mitsubishi PLC systems.  Uses Node, Express, and [mcprotocol](https://github.com/plcpeople/mcprotocol)

## Setup
- Clone repo
- install [Nodejs](https://nodejs.org/en/)
- cd to to root
- ```$ npm install```

## Run Web and MCP In Windows
- Make sure the correct IP is set in MCP.js
- Make sure the port is set in the app.js
- Start the runSCADA.bat file

## Convert History Data In Windows And Create Graph
- Open the excel macro book JSON-CSV/JSON-CSV.xlsm
- Choose a history file from the list (Should be populated at open)
- Click the generate button below the list
- The newly created CSV and xlsx files are saved in their folders
- Save-as to store it to a new location
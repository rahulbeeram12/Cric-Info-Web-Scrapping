# CRICINFO_EXTRACTER - A WEB SCRAPER
## About Cricinfo_Extracter
Made a web scrapper which has ability to scrap the WorldCup 2019 matches and keep those matches in excel and folders.
The purpose of this project is to extract information of worldcup 2019 from cricinfo and present that information in the form of excel and pdf scorecards. The application can be used
to solve real purpose problems of extracting large information from websites.

## TECH STACK USED
 -  JAVASCRIPT
 -  NPM Modules
    -  Minimist--> Takes command line arguments
    -  Axios--> For making http request 
    -  JSDOM--> For getting information in the from of dom tree
    -  EXCEL4NODE--> Used to make excel files
    -  PDF_LIB--> Used to make scorecards in the form of PDFs
 
 ## FEATURES AND FUNCTIONS
 Dowloading data in the form of HTML by making a http request using axios as we are not using any browser so axios will help to achieve this.
 Reading HTML and extracting important and useful information using Jsdom
 Converting matches to teams using Array Manipulation
 Making of excel file and adding important stuff in that excel using excel4node library
 Making pdf and making changes to Template pdf using pdf-lib library.

## TO RUN THIS ON YOUR LOCAL
   First fork this to your profile, then clone it to your desktop
   
   Then install libraries 
   ```bash
  npm install minimist
  npm install axios
  npm install pdf-lib
  npm install excel4node
  npm install jsdom
  
  ```
  
  To run this project use this command
  
  ```bash
  node script.js --src="https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results" --matchData="data.json"
 ```

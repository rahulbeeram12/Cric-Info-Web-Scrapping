// node script.js --src="https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results" --matchData="data.json"

const minimist = require("minimist");
const axios = require("axios");
const jsdom = require("jsdom");
const fs = require("fs");
const excel4node = require("excel4node");
const pdf = require("pdf-lib");
const path = require("path");

const args = minimist(process.argv);

// fetch data from cricinfo
let fetchkaPromise = axios.get(args.src);
fetchkaPromise.then(function (responce) {
    const html = responce.data;
    const dom = new jsdom.JSDOM(html);
    const document = dom.window.document;

    let scoreCards = document.querySelectorAll("div.match-score-block");

    let matches = [];
    for (let i = 0; i < scoreCards.length; i++) {
        let match = {
            team1: "",
            team2: "",
            team1Score: "",
            team2Score: "",
            result: "",
        };

        let cardTeams = scoreCards[i].querySelectorAll("div.name-detail > p.name");

        match.team1 = cardTeams[0].textContent;
        match.team2 = cardTeams[1].textContent;

        let result = scoreCards[i].querySelector("div.status-text");
        match.result = result.textContent;

        let cardTeamScores = scoreCards[i].querySelectorAll("div.score-detail > span.score");

        if (cardTeamScores.length == 2) {
            let team1Score = cardTeamScores[0];
            let team2Score = cardTeamScores[1];

            match.team1Score = team1Score.textContent;
            match.team2Score = team2Score.textContent;
        } else if (cardTeamScores.length == 1) {
            let team1Score = cardTeamScores[0];

            match.team1Score = team1Score.textContent;
        }

        matches.push(match);
    }

    let modifiedMatches = modifyArray(matches);
    let matchJSON = JSON.stringify(modifiedMatches);

    fs.writeFile(args.matchData, matchJSON, function (data) {
        return;
    });

    //write data in excel

    let wb = new excel4node.Workbook();
    let data = JSON.parse(matchJSON);

    let style = wb.createStyle({
        font: {
            bold: true,
        }
    });

    for (let i = 0; i < data.length; i++) {
        let sheet = wb.addWorksheet(data[i].name);

        sheet.cell(1, 1).string('vs').style(style);
        sheet.cell(1, 2).string('My Score').style(style);
        sheet.cell(1, 3).string('Opponent Score').style(style);
        sheet.cell(1, 4).string('Result').style(style);

        for (let j = 0; j < data[i].matches.length; j++) {
            let vs = data[i].matches[j].vs;
            let myscore = data[i].matches[j].myScore;
            let oppscore = data[i].matches[j].opponentScore;
            let result = data[i].matches[j].result;

            sheet.cell(2 + j, 1).string(vs);
            sheet.cell(2 + j, 2).string(myscore);
            sheet.cell(2 + j, 3).string(oppscore);
            sheet.cell(2 + j, 4).string(result);
        }
    }

    wb.write('matches.xlsx');

    // create folders

    createFolders(modifiedMatches);

}).catch(function (err) {
    console.log(err);
});

function createFolders(modifiedMatches) {
    let worldCupPath = path.join(__dirname, 'World Cup Matches');
    fs.mkdirSync(worldCupPath);
    for (let i = 0; i < modifiedMatches.length; i++) {
        let teamName = modifiedMatches[i].name;
        let teamNamePath = path.join(worldCupPath, teamName);
        fs.mkdirSync(teamNamePath);

        for (let j = 0; j < modifiedMatches[i].matches.length; j++) {
            let opponentPath = path.join(teamNamePath, modifiedMatches[i].matches[j].vs + ".pdf");
            createScoreCard(modifiedMatches[i].name, modifiedMatches[i].matches[j], opponentPath);
        }
    }
}

function createScoreCard(selfName, match, path) {
    let team1 = selfName;
    let team2 = match.vs;
    let team1Score = match.myScore;
    let team2Score = match.opponentScore;
    let result = match.result;

    let bytesOfTemplate = fs.readFileSync("Template.pdf");
    let pdfDocKaPromise = pdf.PDFDocument.load(bytesOfTemplate);
    pdfDocKaPromise.then(function(pdfdoc){
        let page = pdfdoc.getPage(0);

        page.drawText(team1, {
            x: 80,
            y: 496,
            size: 15
        });
        page.drawText(team2, {
            x: 217,
            y: 496,
            size: 15
        });
        page.drawText(team1Score, {
            x: 325,
            y: 496,
            size: 15
        });
        page.drawText(team2Score, {
            x: 450,
            y: 496,
            size: 15
        });
        page.drawText(result, {
            x: 100,
            y: 350,
            size: 15
        });

        let modifiedpdfbyteskaPromise = pdfdoc.save();
        modifiedpdfbyteskaPromise.then(function(finalPdfBytes){
            fs.writeFileSync(path,finalPdfBytes);
        }).catch(function(err){
            console.log(err);
        });
    }).catch(function(err){
        console.log(err);
    });
}

function modifyArray(matches) {
    let organisedMatches = [];

    for (let i = 0; i < matches.length; i++) {
        createSingleMatchRecord(matches[i], organisedMatches);
    }

    for (let i = 0; i < matches.length; i++) {
        addMatchesToAppropriateTeam(matches[i], organisedMatches);
    }

    return organisedMatches;
}

function createSingleMatchRecord(matchDetail, organisedMatches) {
    let team1 = matchDetail.team1;
    let team2 = matchDetail.team2;

    let idx = -1;
    for (let i = 0; i < organisedMatches.length; i++) {
        if (team1 == organisedMatches[i].name) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        organisedMatches.push({
            name: team1,
            matches: []
        });
    }

    idx = -1;
    for (let i = 0; i < organisedMatches.length; i++) {
        if (team2 == organisedMatches[i].name) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        organisedMatches.push({
            name: team2,
            matches: []
        });
    }
}

function addMatchesToAppropriateTeam(matchDetail, organisedMatches) {
    let team1 = matchDetail.team1;
    let team2 = matchDetail.team2;
    let team1Score = matchDetail.team1Score;
    let team2Score = matchDetail.team2Score;
    let result = matchDetail.result;

    let idx = -1;
    for (let i = 0; i < organisedMatches.length; i++) {
        if (team1 == organisedMatches[i].name) {
            idx = i;
            break;
        }
    }

    organisedMatches[idx].matches.push({
        vs: team2,
        myScore: team1Score,
        opponentScore: team2Score,
        result: result
    });

    idx = -1;
    for (let i = 0; i < organisedMatches.length; i++) {
        if (team2 == organisedMatches[i].name) {
            idx = i;
            break;
        }
    }

    organisedMatches[idx].matches.push({
        vs: team1,
        myScore: team2Score,
        opponentScore: team1Score,
        result: result
    });
}
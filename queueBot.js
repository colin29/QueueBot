var Discord = require('discord.io');
var http = require('http');
var https = require('https');
var request = require('request')

var botToken = require('./botToken');

var serverid = "410611061297905667"; 
var channelid = "410611061775925249";


var bot = new Discord.Client({
  autorun: true,
  token: botToken.getBotToken()
});

bot.on('ready', function() {
  console.log("Successfully connected: " + bot.username + " - (" + bot.id + ")");
  mainLoop();
});

pollForQueueingPlayers();
var counter = 0;


function mainLoop(){

	var statusText = "Queue: " + rankedPlayers.length + ", " + unrankedPlayers.length;
	bot.setPresence({game: {name: statusText}});
	console.log("status: '" + statusText + "'");
	setTimeout(mainLoop, 5000);
}

//Note, discord's game statuses take anywhere from 5 seconds to 1 minute to respond.


function pollForQueueingPlayers() {
//workaround for a bad ssl certificate
var agentOptions;
var agent;

agentOptions = {
  host: 'tachyon-services-live.cloudapp.net'
, port: '443'
, path: '/'
, rejectUnauthorized: false
};
agent = new https.Agent(agentOptions);


  request({
  	method: 'GET',
  	url: "https://tachyon-services-live.cloudapp.net/v1/products/2641/matchmaking/currentplayers",
  	agent: agent
  },
  	function (error, response, body){
  	
  	if(error){
  		console.error(error);
  	}else{
  		console.log('the decoded data is: ' + body)
  		data = JSON.parse(body)
  		processData(data);
  	}
  	})
  setTimeout(pollForQueueingPlayers, 5000)
}


var rankedPlayers = [];
var unrankedPlayers = [];

function processData(data) {
  rankedPlayers = [];
  unrankedPlayers = [];

  // Gather list of players (persona ids)
   var teamSearch = data.searchingTeams;
  if (teamSearch.length) {
    var matchmakingPool = teamSearch[0];
    for (var i = 0; i < matchmakingPool.teams.length; i++) {
      var team = matchmakingPool.teams[i];
      var player = team.players[0]
      var persona = player.persona;
      
      var isUnranked = (team.parameters.indexOf("unranked:true") >= 0)
      
      var playerObject = {
          persona: persona,
          score: team.score,
          scoreRange: team.lowerRange + "~" + team.upperRange
        }
      
      if (isUnranked) {
        unrankedPlayers.push(playerObject)
      } else {
        rankedPlayers.push(playerObject);
      }
    }
  }

  }


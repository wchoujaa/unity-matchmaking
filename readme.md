# Unity matchmaking

Basic matchmaking service based on Ip address and estimated location. Designed to be used for peer to peer game applications. 

# TODO

monitoring matchmaking process

# Usage 

first install the dependencies

```console
npm install 
```
run the server 

```console
npm start 
 
> matchmaking@1.0.0 start
> node server.js 
> Server running on port 8000!
```

The matchmaking service is now running on port 8000!

To start the matchmaking, as a user, three steps are required:

> http://yourdomain.name.com/register/

this step is required to save the user in the matchmaking system. The http request return a json with a field playerID, which will be used in the next step.

> http://yourdomain.name.com/matchmaking/match/$playerID

This request is sent to the server to put the player in the queue. Every 500 ms, the matchmaking will process the players in the queue and find matches between them.

> http://yourdomain.name.com/matchmaking/lobby/$playerID

Once the matchmaking  has finished, the player will be assigned a lobby ID, and a list of players in the same lobby


# Limitations

Right now the  matchmaking system only works when the ip is found in the database, and an estimated locatin is found. If there is no IP found, the system will not deal with the player.

# Testing

ngrok http 8000

npm start

npm test
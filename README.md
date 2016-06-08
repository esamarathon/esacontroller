## ESA CONTROLLER ##

ESA Controller is a glue for some ESA related applications.
In its current state, it can subscribe to run-data from Charleon's SpeedControl and pass ith through to the Youtube Upload Script by Oromit.

Further it will be able to take the youtube ID and make a new record on ESAVods.com with the run for people to find.

ESA Controller is a  Node.js application built on Express.
It uses no database, instead opting for a static configuration and responsive dataflow (very buzzwordy).

### Usage ###

Install Node.js (Tested on Node v5.0.0 but no special features are used so both LTS and latest as of writing should work fine.)

To start

````
npm start
````

Defaults to using port 3333 (configurable).

### Configuration ###

Configure the application by changing the values of default.json.
It should be mostly self-explanatory.
All config options are in there. Nothing is hidden.


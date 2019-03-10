'use strict';

var Alexa = require('alexa-sdk');
var http = require('http');
var result='';

var handlers = {
  // Open Asset Tracker
  'LaunchRequest': function() {
      this.response.speak('Welcome to Asset Tracker. What Asset ID would you like to search for?').listen('What Asset I.D. would you like to search for?');
         this.emit(':responseReady');
},
 //{number}
  'GetIDIntent': function() {
  	this.attributes['num'] = this.event.request.intent.slots.num.value;
  	var id = this.attributes['num'];
  	this.attributes['denial'] = this.event.request.intent.slots.denial.value;
  
  if(this.attributes['denial']!== 'no')
  	this.response.speak('The asset ID you provided is '+id+'. Say yes to continue or no to select another Asset ID.').listen('Say yes to continue');
  
  	else if(this.attributes['denial'] == 'no')
  	this.response.speak('What Asset ID would you like to search for?').listen();
  	
  	else
  	{this.response.speak('I did not get that. Please try again');}
  	
  	this.emit(':responseReady');
  },

//Getting Location
  'GetLocationIntent': function() {
  	var id= this.attributes['num'];
  	//http://assettracksvapp.azurewebsites.net/api/search/get?assetID=4
    var options = {
  host: 'assettracksvapp.azurewebsites.net',
  path: '/api/search/get?assetID='+encodeURIComponent(id),
  method: 'GET',
};

  var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        
            
        });
        
        
        res.on('end',() => {
           result =JSON.parse(responseString);
           
           console.log(result.data2);
           console.log("length of result "+ result.length+" "+result);
           var status = result.status;

     if (status == 'FAILED') 
      {
          
          this.response.speak('The Asset ID selected by you is wrong. Please provide another Asset ID or say stop, to stop this service.').listen();
      }
      else
      {
          var len = result.data2.length;
          
      
      if(len === 0)
      {
          
          this.response.speak('The product corresponding to Asset ID '+id+' is with the Supplier. If you want to search for another product, provide the Asset ID, or say stop, to stop this service.' ).listen();
      }
      
       else
       {var loc = result.data2[0][5];
       var dest = result.data2[len-1][6];
       
       var sname = result.data2[0][0];
       var mname = result.data2[len-1][2];
      
       
       
       //var dest = result.data2[1][6];
       if(len > 1)
       {this.response.speak('The product corresponding to Asset ID '+id+ ' is with '+mname+'  at '+dest+'. Say more, to know more about the product locations.').listen(); 
       }
       else if(len === 1)
       { this.response.speak('The product corresponding to Asset ID '+id+' is with '+mname+' at '+result.data2[0][6]+'. If you want to search for another product, provide the Asset ID, or say stop, to stop this service.').listen();
       }}}
           this.emit(':responseReady');
      });  //return the data when streaming is complete
       
    });
    req.end();

  },
  
  //moreinfo
    'MoreInfoIntent' : function(){
      var id= this.attributes['num'];
      var len = result.data2.length;
      
       var sname = result.data2[0][0];
       var mname = result.data2[0][2];
      var speech = 'The product corresponding to Asset ID '+id+' was supplied by '+sname+' at '+result.data2[0][5]+' and went through';
      var i=0;
     if(len >1)
      {
          for(i=0;i<len;i++)
        { 
          if(i===0)
          {
              speech = speech +' '+result.data2[i][2]+' at '+result.data2[i][6];
              
          }
          else if(i>0 && i<len-2)
          {
              speech = speech +', '+result.data2[i][2]+' at '+result.data2[i][6];
          }
          
          else if(i === len-1)
          {
              speech = speech + ' to reach '+result.data2[i][2]+' at '+result.data2[i][6]+'.';
          }
          
      }
      
      
      
      this.response.speak(speech+ " If you want to search for another product, provide the Asset ID, or say stop, to stop this service.").listen();
      
         this.emit(':responseReady');
      }
      
      else if(len===1)
      
      {
          this.response.speak('More information is not available for selected Asset ID. If you want to search for another product, provide the Asset ID or say stop, to stop this service.').listen();
      }
      
      this.emit(':responseReady');
      
  },
  
  'AMAZON.HelpIntent' : function(){
      this.response.speak('Locate your assets by providing the Asset ID.').listen();
      this.emit(':responseReady');
  },
  
  //Stop
  'AMAZON.StopIntent': function() {
      this.response.speak('Ok, Goodbye.');
      this.emit(':responseReady');
  },

  // Cancel
  'AMAZON.CancelIntent': function() {
      this.response.speak('Ok, Goodbye.');
      this.emit(':responseReady');
  },
  
  'Unhandled': function () {
    this.emit(':ask', 'I did not get that. Please try again');
},
};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};


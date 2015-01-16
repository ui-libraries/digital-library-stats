/* The idea of the application is to gather Google Analytics data for three types of collection -- Iowa Digital Library collections (digital.lib.uiowa.edu), finding aids (which are located in two different places -- hence the two different queries for finding aids that you'll see below) and DIY History collections (diyhistory.lib.uiowa.edu).  */

//Global variables

var collections = [];  //information about each collection
var finalCollections = [];  //the array to be used to copy to a JSON file
var dates = []; //the dates checked on the html form
var startdate; //the date on which to start the Google analytics query
var enddate;  //the date on which to end the Google analytics query
var queryIndex; //the index of the current collection being queried
var recheck = 0;  //this integer keeps track of the number of times a query needs to be checked for API failure
var queryType = "dc";  //this holds the type of query the user wants to make (indicated by the menu selection)
var queryTypeGetReports = "dc";
var faQuery = "1";  //this hold the current finding aid query (2 queries must be made)
var submissionStats = {}; 

//Collections that we want to display currently.  Update as necessary!
var allowedCollections = ["Pioneer Lives", "Civil War Diaries and Letters", "Iowa Women’s Lives: Letters and Diaries", "Building the Transcontinental Railroad", "Nile Kinnick Collection", "Szathmary Culinary Manuscripts and Cookbooks", "World War I Diaries and Letters", "World War II Diaries and Letters"];


//End global variables

function getOutstandingReports() {
//Generate a list of outstanding reports, display results as checklist in admin.html when user selects an option
	console.log(queryTypeGetReports);
	$.ajax({
		type: "POST",
		url: "readDirectory.php",
		data: {action: queryTypeGetReports},
		dataType: "json",
		success: function( data ) {
			var datesNeeded = [];

			$( "#make-api-call-button" ).hide();

			$.each( data, function( key, val ) {

				datesNeeded.push( 
					"<li><input type='checkbox' name='digCol' value=" + val + "> " 
					+ parseMonthAbbv( val ) + " " + parseYear( val ) +  "</li>" );
			});

			if ( datesNeeded.length > 0 ) {
				$( "#outstanding > ul" ).html( datesNeeded.join( '' ) );
				$( "#make-api-call-button" ).show();
			} 
			else {
				$( "#outstanding > ul" ).html('<li><em>There are no outstanding reports.</em></li>');
			}

			return true;
		},
		error: function( xhr, textStatus, errorThrown ) {
			console.log( xhr + " " + textStatus + " " + errorThrown );
			console.log("ERRORTOWN");
			return false;
		}
	});
}

//These parsing functions are used to format dates for display (getOutstandingReports) and for Google Analytics queries (setDates)
function parseYear( dateVal ) {
	return dateVal.substring( 0, 4 );
}

function parseMonthNum( dateVal ) {
	return dateVal.substring( 4, 6 );
}

function parseMonthAbbv( dateVal ) {
//this function receives a month as a numerical value and 
//returns the month as a three-letter abbreviation.  There is no real reason for this to be a switch statement instead of an array.  
	
	var month = parseMonthNum( dateVal );

	switch( month ) {
		case "01":
			month = "Jan";
			break;
		case "02":
			month = "Feb";
			break;
		case "03":
			month = "Mar";
			break;
		case "04":
			month = "Apr";
			break;
		case "05":
			month = "May";
			break;
		case "06":
			month = "Jun";
			break;
		case "07":
			month = "Jul";
			break;
		case "08":
			month = "Aug";
			break;
		case "09":
			month = "Sep";
			break;
		case "10":
			month = "Oct";
			break;
		case "11":
			month = "Nov";
			break;
		case "12":
			month = "Dec";
			break;
	}

	return month;
}


function makeApiCall() {

	//get an array of all checked outstanding reports
	var chk = $( "#outstanding" ).find( "input:checked" );

	if ( chk.length > 0 ) {  //if at least one outstanding report is checked
		initiateContext();
	} else {
		alert( "Please select an outstanding report." );
	}
}

function initiateContext() {
	// set variables necessary for all queries
	$( "#make-api-call-button" ).button( "disable" );
	getDates();
	queryType = $( ".ui-selected" ).attr( "id" );

	if ( queryType == "dc" ) {
		console.log( "initiate context for digital collections" );
		initiateCollectionsArray( "master/dcmaster.json" );
	} else if ( queryType == "fa" ) {
		faQuery = 1;
		console.log( "initiate context for finding aid" );
		collections = [];
		initiateQuery();  
	}
	else if ( queryType == "diy" ) {
	
		//For the other query types, this is handled in initiatecollectionsarray

		console.log( "initiate context for DIY History" );
		
		//Trying to mimic format here.  
		collections = {"Pioneer Lives": {"name": "Pioneer Lives", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 3353, "submissions": 0}, "Szathmary Culinary Manuscripts and Cookbooks": {"name": "Szathmary Culinary Manuscripts and Cookbooks", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 8381, "submissions": 0}, "Iowa Women’s Lives: Letters and Diaries": {"name": "Iowa Women’s Lives: Letters and Diaries", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 9519, "submissions": 0}, "Building the Transcontinental Railroad": {"name": "Building the Transcontinental Railroad", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 1872, "submissions": 0}, "Civil War Diaries and Letters": {"name": "Civil War Diaries and Letters", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 8827, "submissions": 0}, "Nile Kinnick Collection": {"name": "Nile Kinnick Collection", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 1747, "submissions": 0}, "World War I Diaries and Letters": {"name": "World War I Diaries and Letters", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 1937, "submissions": 0}, "World War II Diaries and Letters": {"name": "World War II Diaries and Letters", "alias": "whatev", "pageviews": 0, "visitors": 0, "items": 4873, "submissions": 0}};
		
		for ( var i = 0; i < collections.length; i++ ) {
			collections[i][ "pageviews" ] = 0;
			collections[i][ "visitors" ] = 0;
		}
		initiateQuery();
	}
}

function initiateCollectionsArray( jsonSource ) {
	//read master.json, which holds the name, alias, and number of items for each collection
	//populate global collections array with values from master.json
	//when successfully executed, call initiateQuery function

	//clear any data from previous queries
	
	
	collections = [];

	$.getJSON( jsonSource, function( data ) {  

		$.each( data, function( collection, object ) {

			$.each( object, function( num, obj ) {

				var myItem = {};

				$.each( obj, function( key, val ) {

					myItem[ key ] = val;

				});

				collections.push( myItem );			
			});
		});
	})
	.done( function() {

		//assign default values for pageviews and visitors
		for ( var i = 0; i < collections.length; i++ ) {
			collections[i][ "pageviews" ] = 0;
			collections[i][ "visitors" ] = 0;
		}
		console.log( "Collections array initated." );

		initiateQuery();
	})
	.fail( function() {
		console.log( "Error: unable to read json file." )
	});	
}

function initiateQuery() {
	// set variables necessary for one particular query
	// and trigger the query

	console.log( "initiate query" );

	setDates();

	if ( queryType == "dc" ) {
		reportProgress( -1 );
	} else {
		document.getElementById( "progress" ).innerHTML = "Processing...";
	}
	
	queryAccounts();
}

function getDates() {
	// get all of the checked dates from the form
	// and store in global array
	dates = $( "input:checked" );	
}

function setDates() {
	//create startdate and enddate from dates and index 0

	//format dates for Google Analytics API query
	var yr = parseYear( dates[0].value );
	var mo = parseMonthNum( dates[0].value );
	startdate = yr + "-" + mo + "-01";
	enddate = yr + "-" + mo + "-" + daysInMonth( mo, yr );	
}

function daysInMonth( month, year ) {
	// this function receives a month and year and returns
	// the number of days in the month
    return new Date( year, month, 0 ).getDate();
}


/* Get the user's first profile ID */

function queryAccounts() {
	console.log( 'Querying Accounts.' );

	// Get a list of all Google Analytics accounts for this user
	gapi.client.analytics.management.accounts.list().execute( handleAccounts );
}

function handleAccounts( results ) {
	if ( !results.code ) {
		if ( results && results.items && results.items.length ) {

			// Get the first Google Analytics account
			var firstAccountId = results.items[0].id;

			// Query for Web Properties
			queryWebproperties( firstAccountId );

		} else {
			console.log( 'No accounts found for this user.' )
		}
	} else {
		console.log( 'There was an error querying accounts: ' + results.message );
		$( "#progress" ).hide();
		$myString = "There was an error querying accounts: " + results.message + 
			"<br/>Please sign out of any open Google accounts, refresh this page, and sign into the University of Iowa Digital Libraries account.";
		outputToPage( $myString );
	}
}

function queryWebproperties( accountId ) {
	console.log('Querying Webproperties.');

	// Get a list of all the Web Properties for the account
	gapi.client.analytics.management.webproperties.list( { 'accountId': accountId } ).execute( handleWebproperties );
}

function handleWebproperties( results ) {
	if ( !results.code ) {
		if ( results && results.items && results.items.length ) {

		// Get the first Google Analytics account
		var firstAccountId = results.items[0].accountId;

		// Get the first Web Property ID
		var firstWebpropertyId = results.items[0].id;

		// Query for Profiles
		queryProfiles( firstAccountId, firstWebpropertyId );

		} else {
			console.log( 'No webproperties found for this user.' );
		}
	} else {
		console.log( 'There was an error querying webproperties: ' + results.message );
	}
}

function queryProfiles( accountId, webpropertyId ) {
	console.log('Querying Profiles.');

	// Get a list of all Profiles for the first Web Property of the first Account
	gapi.client.analytics.management.profiles.list({
		'accountId': accountId,
		'webPropertyId': webpropertyId
	}).execute( handleProfiles );
}

function handleProfiles( results ) {
	if ( !results.code ) {
		if ( results && results.items && results.items.length ) {

			console.log("HANDLE PROFILES");
			console.log(results.items);
			// Get the first Profile ID
			var firstProfileId = results.items[0].id;

			// Step 3. Query the Core Reporting API
			// Google Analytics API only allows 1 query per second.  The setInterval function sets the rate 
			// at which the queries are sent!

			if ( queryType == "fa" ) {

				if ( faQuery == 1 ) {
					queryCoreReportingApiFa( firstProfileId );
				} else if ( faQuery == 2 ) {
					queryCoreReportingApiFa2( firstProfileId );
				}

			} else if ( queryType == "diy" ) {
				console.log ("diy handle profiles!");
				queryIndex = 0;
				DIYQueryResolver();

			}	
			else {
				//Digital collections case
				queryIndex = 0;
				digCollQueryResolver();
				/*
				var interval = setInterval( function() {
					queryIndex = i; 
					console.log( i + ". " + collections[i][ "name" ] )
					var collectionId = collections[i][ "alias" ];
					queryCoreReportingApi( firstProfileId, collectionId );
					reportProgress( i );
					i++;
					if( i >= collections.length ) {
						clearInterval( interval );
					}
				}, 3000 );
				*/
			}

		} else {
			console.log( 'No profiles found for this user.' );
		}
	} else {
		console.log( 'There was an error querying profiles: ' + results.message );
	}
}


//Iterate through the digital collections to be queried, making the appropriate API calls
function digCollQueryResolver(){ 
	if (queryIndex < collections.length){
		var collectionId = collections[queryIndex][ "alias" ];
		queryCoreReportingApi( collectionId );
		reportProgress( queryIndex );
	}
	else {  //if this is the last item in this query

		updateFinalCollections();

		console.log( "recheck=" + recheck );
		
		if ( recheck < 2 ) {
			checkFailedQueries();
		} else {
			writeToJSONFile( "digital_collections" );  
			//reEvaluateUserInput(); //check to see if there are other query requests
		} 
	}
}

//Iterate through the DIY collections to be queried, making the appropriate API calls
function DIYQueryResolver(){
	if (queryIndex < allowedCollections.length){
		currentCollection = allowedCollections[queryIndex];
		DIYQuery(currentCollection);
		reportProgressDIY( queryIndex );
	}
	else {
		finalCollections = collections;
		writeToJSONFile("diy_history");
	}
}


function queryCoreReportingApi( colId ) {
	console.log( 'Querying Core Reporting API.' );
	
	// Use the Analytics Service Object to query the Core Reporting API
	// Unique pageviews and visitors
	setTimeout(function(){
	gapi.client.analytics.data.ga.get({
		'ids': 'ga:3923133',
		'start-date': startdate,
		'end-date': enddate,
		'metrics': 'ga:uniquePageviews,ga:visitors',
		'filters': 'ga:pagePath=@/' + colId + '/;ga:pagePath!@search'
	}).execute( handleCoreReportingResults );
	}, 1000);

}

//The queryCoreReporting functions below get the information from Google Analytics

//Finding aids must be queried in two different locations (collguides.lib.uiowa.edu and lib.uiowa.edu) to get all the data, at least for the time being.  Note the different ids for the two queries below, which can be looked up in Google Analytics
function queryCoreReportingApiFa( profileId ) {
	console.log( 'Querying Core Reporting API for finding aids.' );
	// Use the Analytics Service Object to query the Core Reporting API

	gapi.client.analytics.data.ga.get({
		'ids': 'ga:4574205',
		'start-date': startdate,
		'end-date': enddate,
		'metrics': 'ga:uniquePageviews',
		'dimensions': 'ga:pageTitle,ga:pagePath',
		'filters': 'ga:pagePath=@/msc,ga:pagePath=@/rg'
	}).execute( handleCoreReportingResults );
}

function queryCoreReportingApiFa2() {
	// Use the Analytics Service Object to query the Core Reporting API

	gapi.client.analytics.data.ga.get({
		'ids': 'ga:69793861',
		'start-date': startdate,
		'end-date': enddate,
		'metrics': 'ga:uniquePageviews',
		'dimensions': 'ga:pageTitle,ga:pagePath',
		'filters': 'ga:pagePath=@/?rg,ga:pagePath=@/?msc,ga:pagePath=@/?iwa'
	}).execute( handleCoreReportingResults );
}


function DIYQuery(currentCollection){
	setTimeout(function(){
	gapi.client.analytics.data.ga.get({
	'ids': 'ga:64453574',
	'start-date': startdate,
	'end-date': enddate,
	'filters': 'ga:pageTitle=~' + currentCollection,
	'metrics': 'ga:uniquePageviews, ga:visitors'			
	}).execute(handleCoreReportingResults);
	}, 1000);
} 



function handleCoreReportingResults( results ) {
	if ( results.error ) {
		console.log( 'There was an error querying core reporting API: ' + results.message );
	} else {
		if ( queryType == "dc") {
			saveResults( results );
		} else if ( queryType == "fa" ) {
			saveResultsFa( results );
		} else if ( queryType == "diy") {
			saveResultsDIY ( results ) ;
		}
	}
}


/* Output the results */

//This only saves results for digital collections.  Finding aids and DIY history pages are below
function saveResults( results ) {

	console.log( "saveResults called.  The results are:" );

	console.log(results)

	if ( results.rows && results.rows.length ) {

		// add the query results to the collections array (unique pageviews, visitors)
		collections[ queryIndex ][ "pageviews" ] = parseInt( results.rows[0][0] );
		collections[ queryIndex ][ "visitors" ] = parseInt( results.rows[0][1] );

	} else {
		console.log( 'No results found' );
	}
	
	queryIndex++;

	//Calls digCollQueryResolver to check if additional queries are necessary 
	digCollQueryResolver();
}

//This only saves results for finding aids.  DIY history is below
function saveResultsFa( results ) {
	
	if ( results.rows && results.rows.length ) {
		console.log( "results.rows.length = " + results.rows.length );
		var myString="";

		for ( var i = 0; i < results.rows.length; i++ ) {
			
			var title = results.rows[i][0];
			var path = results.rows[i][1];
			var views = parseInt( results.rows[i][2] );
			var arch = "";

			//check path for case-insensitive strings that will identify the archives 
			var msc = path.match( /(\/msc|\/?msc)/i );  
			var rg = path.match( /(\/rg|\/?rg)/i );
			var iwa = path.match( /\/?iwa/i );

			if ( msc ) {
				arch = "Special Collections";
			} else if ( rg ) {
				arch = "University Archives";
			} else if ( iwa ) {
				arch = "Iowa Women's Archives";
			}

			title = title.replace( "<", "" );
			title = title.replace( ">", "" );

			var myObject = {
				name : title,
				pagepath : path,
				pageviews : views,
				archives : arch
			}

			if ( !title.match( "Not Found" ) && !title.match( "Record Groups - Special Collections & University Archives" ) ) {
				
				if( collections.length != 0 ) {

					//check to see if this finding aid is already listed in collections array
					for ( var j = 0; j < collections.length; j++ ) {
					var match = false;
						if ( collections[j]["name"] && collections[j]["name"] == title ) {

							//this finding aid is already listed in the array
							//add pageviews to existing record
							collections[j]["pageviews"] += views;
							match = true;
						} 
					}
					if ( match == false ) {

						//this finding aid is not already listed
						//add it to collections array
						collections.push( myObject );
					}
				} else {
					collections.push( myObject );
				}
			}
		}

		if ( faQuery == 1 ) {
			faQuery = 2;
			queryAccounts();
		} else if ( faQuery == 2 ) {
			//copy collections to finalCollections 
			//finalCollections is the array that is written to the JSON file
			finalCollections = collections;
			writeToJSONFile( "finding_aids" );
		}

	} else {
		console.log( "No results found" );
	}
}

//Save results for DIYHistory
function saveResultsDIY (results) {
	console.log(results);
	allResults = results.totalsForAllResults
	collections[currentCollection]["pageviews"] += parseInt(allResults["ga:uniquePageviews"]);
	collections[currentCollection]["visitors"] += parseInt(allResults["ga:visitors"]);
	queryIndex++;
	
	//Check if additional queries need to be made
	DIYQueryResolver();
}


function updateFinalCollections() {
	//Final collections is either set (the if) or updated if already set.  It may need updating if some collections incorrectly list zero pageviews for a given month.  
	if ( recheck == 0 ) {
		finalCollections = collections;
	} else {
	//Update final collections with correct pageview information
		for( var i = 0; i < finalCollections.length; i++ ) {
			for( var j = 0; j < collections.length; j++ ) {
				if ( finalCollections[i][ "alias" ] == collections[j][ "alias" ] ) {
					finalCollections[i][ "pageviews" ] = collections[j][ "pageviews" ];
					finalCollections[i][ "visitors" ] = collections[j][ "visitors" ];
				}
			}
		}
	}
}

//Probably not necessary anymore, but this functionality verifies that collections listed as zero pageviews should actually have zero pageviews
function checkFailedQueries() {
	console.log("check failed queries called");
	//increment recheck 
	recheck ++;

	var tempArray = [];

	for ( var i = 0; i < collections.length; i++ ) {

		if ( collections[i][ "pageviews" ] == 0 ) {
			console.log( collections[i][ "alias" ] + " needs to be requeried" );
			tempArray.push( collections[i] );
		}
	}

	collections = tempArray;

	if ( tempArray.length > 0 ) {
		initiateQuery();
	} 
	else {
		writeToJSONFile("digital_collections");
	}
}

function writeToJSONFile( myDirectory ) {

	console.log( "write to JSON called" );

	//create myReport object
	var myReport = { monthlyStats : finalCollections };

	//convert report to JSON
	var myJSON = JSON.stringify( myReport );

	// post JSON to PHP
	$.ajax({
		type: "POST",
		url: "writeMaster.php",
		data: { 
			json : myJSON,
			reportName : dates[0].value + ".json",
			directory : myDirectory
		},
		dataType: "text",
		success: function( data ) {
			console.log( data );
			document.getElementById( "outputDiv" ).innerHTML += data + "<br/>";
			reEvaluateUserInput();  //check to see if there are other query requests
			return true;
		},
		error: function( xhr, textStatus, errorThrown ) {
			console.log( xhr + " " + textStatus + " " + errorThrown );
			outputToPage( "There was an error writing this report:<br/>" + xhr + " " + textStatus + " " + errorThrown );
			return false;
		}
	});
}

function reEvaluateUserInput() {
	// if there is more than one date left in the dates array,
	// remove the date that was just queried ( dates at index 0 ) 
	// and trigger a new query with the next date

	if ( dates.length > 1 ) {

		var tempArray = [];

		for (var i = 1; i < dates.length; i++) {
			tempArray.push( dates[i] );
		}

		dates = tempArray;

		recheck = 0;

		if ( queryType == "dc" ) {
			initiateCollectionsArray( "master/dcmaster.json" );
		} else {
			collections = [];
			initiateQuery();
		}

	} else {

		refreshInterface();
	}
}

function refreshInterface() {
	$( "#make-api-call-button ").button( "enable" );
	recheck = 0;
	getOutstandingReports();
}

function reportProgress( index ) {
	//display progress
	var totalDates = $( "input:checked" ).length;
	var totalQueries = totalDates * 3;
	var currentQuery = ( ( ( totalDates - dates.length ) * 3 ) + recheck ) + 1; 

	document.getElementById( "progress" ).innerHTML = 
		"Processing step " + currentQuery + " of " +  totalQueries +
		"... " + ( collections.length - ( index + 1 ) ) + " seconds remaining.";
}

function reportProgressDIY( index ) {
	document.getElementById( "progress" ).innerHTML = 
		"Processing step " + (index + 1) + " of " +  allowedCollections.length +
		"... " + ( allowedCollections.length - ( index + 1 ) ) + " seconds remaining.";

}



function clearProgress() {
	//clear progress display
	document.getElementById( "progress" ).innerHTML = "";
}

function outputToPage( output ) {
	document.getElementById( 'outputDiv' ).innerHTML = output;
}





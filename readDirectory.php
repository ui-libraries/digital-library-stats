<?php

/*
* This script receives a String that is the name of a directory.
* It assumes that the files in this directory are reports with file 
* names formatted YYYYYMM.
* It reads all files in the directory.
* Using the current year and month, it calculates any outstanding 
* reports, and returns them as a comma-separted String in the 
* format YYYYMM,YYYYMM,...YYYYMM
* If the directory is not found, it returns an error message.
*/

header( 'Content-type: application/json');

	$action = $_POST['action'];

	if ( $action == "dc" ) {
		$dirName = "reports/digital_collections";
	} else if ( $action == "fa" ) {
		$dirName = "reports/finding_aids";
	} else if ( $action == "diy" ) {
		$dirName = "reports/diy_history";
	}
	
	$currentYear = date(Y);
	$currentMonth = date(n);
	$possibleReports = array();
	$existingReports = array();
	$neededReports = array();
	
	// check to see if directory exists
	if ( is_dir( $dirName ) ) {
		
		//IMPORTANT!  DIY reports are only available from April 2014 onward, so they need to be handled as a special case.
		if ( $action == "diy" ){
			
			//If we're in 2014, check only up to the current month
			if ($currentYear == 2014){
			
				$monthEnd = $currentMonth;
			}
			//If it's 2015 or later (lol?), check all of 2014
			else {
				$monthEnd = 12;
			}
			//Handles just the year 2014
			for ( $mo = 4; $mo < $monthEnd; $mo++ ) {
				
				if ( $mo < 10 ) {
					$mo = "0" . (string)$mo;
				}
				array_push( $possibleReports, ( $currentYear . (string)$mo ) );
			}
			
			//Handles years after 2014 if it's after 2014
			if ($currentYear > 2014){
				for ( $y = 2015; $y <= (int)$currentYear; $y++ ) {
					if ($y == $currentYear){
						$monthEnd = $currentMonth;
					}
					else {
						$monthEnd = 12;
					}
					for ( $mo = 1; $mo < $monthEnd; $mo++ ) {
				
						if ( $mo < 10 ) {
							$mo = "0" . (string)$mo;
						}
						array_push( $possibleReports, ( $currentYear . (string)$mo ) );
					}
				}
			}
		}
		else {
			// generate all possible report names formatted as YYYYMM
			// assumes earliest possible report is Jan 2013
			for ( $y = 2013; $y < (int)$currentYear; $y++ ) {
			
				for ( $m = 1; $m < 13; $m++ ) {
				
					if ( $m < 10 ) {
						$m = "0" . (string)$m;
					}
					array_push( $possibleReports, ( (string)$y . (string)$m ) ); 
				}
			}
			
			for ( $mo = 1; $mo < (int)$currentMonth; $mo++ ) {
				
				if ( $mo < 10 ) {
					$mo = "0" . (string)$mo;
				}
				array_push( $possibleReports, ( $currentYear . (string)$mo ) );
			}
		}
		
		// open directory
		$directory = opendir( $dirName ); 
		
		// iterate through directory
		while ( ( $file = readdir( $directory ) ) !== false ) {
			
			$fileDate = substr( $file, 0, 6 );
				
			// if the file name matches a possible report, 
			// add the file name to existingReports array
			foreach( $possibleReports as $pr ) {
			
				if ( $fileDate === $pr ) {
					array_push( $existingReports, $fileDate );
				}
			}
		}
		
		// close directory
		closedir( $directory ); 
		
		$neededReports = array_diff($possibleReports, $existingReports);
		
		echo json_encode( $neededReports );

		
	} else {
		echo "{}";
	}
	
?>
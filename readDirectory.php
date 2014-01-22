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
	}
	
	$currentYear = date(Y);
	$currentMonth = date(n);
	$possibleReports = array();
	$existingReports = array();
	$neededReports = array();
	
	// check to see if directory exists
	if ( is_dir( $dirName ) ) {
	
		// generate all possible report names formatted as YYYYMM
		// assumes earliest possible report is Jan 2012
		for ( $y = 2012; $y < (int)$currentYear; $y++ ) {
		
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
		
		// add any possible reports that do not exists to neededReport array
		foreach( $possibleReports as $po ) {
			
			$match = false;
			
			foreach( $existingReports as $ex ) {
				if ( $po === $ex ) {
					$match = true;
				}
			}
			
			if ( !$match ) {

				array_push( $neededReports, $po );

			}
		}

		echo json_encode( $neededReports );

		
	} else {
		echo "{}";
	}
	
	
?>
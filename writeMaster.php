<?php

	//header( 'Content-Type: application/json; charset=utf-8' );

	$json = $_POST['json'];
	$reportName = $_POST['reportName'];
	$directory = "reports/" . $_POST['directory'];
	$fp = $fp = $directory . "/" . $reportName;

	if ( json_decode( $json ) != null ) {

		// open directory
		$directory = opendir( $directory ); 

		//open file
		$file = fopen( $fp, "w" ) or die ( "Error: could not open " . $reportName );
		
		//write file
		fwrite( $file, $json ) or die ( "Error: could not write " . $reportName );
		
		//close file
		fclose( $file );

		// close directory
		closedir( $directory );

		echo "Report successfully written at " . $reportName;

	}	else {

		echo "Error: Could not recognize JSON encoded text for " . $reportName;
	}
	
?>
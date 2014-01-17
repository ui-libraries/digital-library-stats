<?php
/*
* This script receives a String that is the name of a directory.
* It assumes that the files in this directory are reports with file 
* names formatted YYYYYMM.
* It reads all files in the directory.
*/
	header( 'Content-type: application/json' );

	$action = $_POST['action'];
	$dirName = "reports/" . $action;
	$reports = array();

	// check to see if directory exists
	if ( is_dir( $dirName ) ) {

		// open directory
		$directory = opendir( $dirName ); 
		
		// iterate through directory 
		while ( ( $file = readdir( $directory ) ) !== false ) {

			//add file names to reports array
			array_push( $reports, $file );
		}

		// close directory
		closedir( $directory ); 
	}

	//sort array in reverse alphabetical order
	rsort( $reports );

	echo json_encode( $reports );

?>
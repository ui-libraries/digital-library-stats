<?php

	$directory = "reports/digital_collections";
	$filename = "test3.txt";
	$fp = $directory . "/" . $filename;

	$dir = opendir( $directory );
	$file = fopen( $fp,"w") or die( "cannot open file" );
	echo fwrite($file,"Hello Coffee. Cake!");
	fclose($file);
	closedir( $dir );
	echo("end");
?>
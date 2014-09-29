<?php 

$string = array("Szath" => 2, "Pioneer" => 3);
$collections = $_POST['collections'];
//Works b/c 5.4 allows for [] to declare arrays -- probably needs tweaked w/ older versions
foreach ($collections as $collection){
	$string[2] = 3;
}
echo json_encode( $string );
?>
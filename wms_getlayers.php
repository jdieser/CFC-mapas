<?php 

$url = $_GET['url'] . '?service=WMS&request=GetCapabilities';

$str = file_get_contents( $url );
$xml = simplexml_load_string( $str );
$returnArray = array();

foreach($xml->Capability->Layer->Layer as $child) {
  		array_push($returnArray, array('name' => (string)$child->Name, 'title' => (string)$child->Title));
}

echo json_encode($returnArray);

?>


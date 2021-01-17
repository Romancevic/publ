<?php
$cont = file_get_contents('polygon/Cyprus.txt');
$obj = json_decode($cont);

echo '<pre>';print_r($obj[0]);
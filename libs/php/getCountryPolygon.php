<?php

    $executionStartTime = microtime(true);

    $text = file_get_contents('./json/countryBorders'.substr($_REQUEST['country'], 0, 2).'.geo.json');

    $countryBorders = json_decode($text, true);

    $border = null;

    foreach ($countryBorders['features'] as $feature) {
        if ($feature["properties"]["ISO_A3"] == $_REQUEST['country']) {
            $border = $feature;
            break;
        }
    }

    $url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=' . $_REQUEST['$iso3'] . '&country=' . $_REQUEST['country'] .  '&username=Romancevic&style=full';
    $url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=it&country=USA&username=Romancevic&style=full';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $countryInfo = json_decode($result,true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['border'] = $border;
    $output['data']['countryInfo'] = $countryInfo;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>

<?php
$apiKeyOpenweathermap = '773dff796f0703f79e10f7dcc27457ee';
$url = 'https://api.openweathermap.org/data/2.5/weather?q='.$_POST['q'].'&appid='.$apiKeyOpenweathermap;
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'q='.$_POST['q']);
$result = curl_exec($ch);

curl_close($ch);

echo trim($result);
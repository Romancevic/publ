<?php
$apiKeyOpencagedata = 'b8664279f853412eb116e26d7923039f';
$url = 'https://api.opencagedata.com/geocode/v1/json?q='.str_replace(',', '+', $_POST['q']).'&key='.$apiKeyOpencagedata;
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_POST, true);
//curl_setopt($ch, CURLOPT_POSTFIELDS, 'q='.$_POST['q'].'&lang='.$_POST['lang']);
$result = curl_exec($ch);

curl_close($ch);

echo $result;
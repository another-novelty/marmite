<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ApiClientService
{
    protected $baseUrl;

    public function __construct($baseUrl = null)
    {
        $this->baseUrl = $baseUrl;

        Log::info('ApiClientService initialized with base URL: ' . $this->baseUrl);
    }

    /**
     * Send a GET request to the API
     * 
     * @param string $endpoint The endpoint to call
     * @param array $params The query parameters
     * @param array $headers The headers to send
     * @return mixed The response from the API interpreted as JSON
     */
    public function get($endpoint, $params = [], $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ]): mixed
    {
        $url = $this->baseUrl . $endpoint;
        if ($params != null && count($params) > 0){
            $url .= '?' . http_build_query($params);
        } 
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    /**
     * Send a POST request to the API
     * 
     * @param string $endpoint The endpoint to call
     * @param array $data The data to send
     * @param array $headers The headers to send
     * @return mixed The response from the API interpreted as JSON
     */
    public function post($endpoint, $data = [], $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ])
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}
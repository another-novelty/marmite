<?php

namespace App\Services;

use App\Services\ApiClientService;

class MiteApiClient extends ApiClientService {
    protected $apiKey;

    protected $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json',
        'User-Agent: MarmiteApp/1.0 (https://github.com/another-novelty/marmite)'
    ];

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        parent::__construct(config('services.mite.base_url'));
    }

    public function get($endpoint, $params = [], $headers = []) : mixed {
        $headers = array_merge($this->defaultHeaders, $headers);

        $headers = array_merge($headers, [
            'X-MiteApiKey: ' . $this->apiKey
        ]);

        return parent::get($endpoint, $params, $headers);
    }

    public function post($endpoint, $data = [], $headers = []) {
        $headers = array_merge($this->defaultHeaders, $headers);
        $headers = array_merge($headers, [
            'X-MiteApiKey: ' . $this->apiKey,
        ]);

        return parent::post($endpoint, $data, $headers);
    }

    public function patch($endpoint, $data = [], $headers = []) {
        $headers = array_merge($this->defaultHeaders, $headers);
        $headers = array_merge($headers, [
            'X-MiteApiKey: ' . $this->apiKey,
        ]);

        return parent::patch($endpoint, $data, $headers);
    }

    public function delete($endpoint, $headers = []) {
        $headers = array_merge($this->defaultHeaders, $headers);
        $headers = array_merge($headers, [
            'X-MiteApiKey: ' . $this->apiKey,
        ]);

        return parent::delete($endpoint, $headers);
    }

    public function put($endpoint, $data = [], $headers = []) {
        $headers = array_merge($this->defaultHeaders, $headers);
        $headers = array_merge($headers, [
            'X-MiteApiKey: ' . $this->apiKey,
        ]);

        return parent::put($endpoint, $data, $headers);
    }
    
}
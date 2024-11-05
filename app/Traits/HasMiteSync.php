<?php

namespace App\Traits;

use App\Models\MiteAccess;
use App\Services\MiteApiClient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait HasMiteSync
{
    public function syncWithMite()
    {
        $mite = $this->miteAccess->mite();

        $miteModel = $this->getMiteModel();

        $miteData = $mite->get($this->mite_id);

        $this->fill($miteModel::newFromMite($miteData)->toArray());

        $this->last_synced_at = now();

        $this->save();
    }

    public function getMiteModel()
    {
        return 'App\Models\\' . class_basename($this);
    }

    abstract public static function newFromMite($mite_data, MiteAccess $miteAccess);
    abstract public function toMite(): array;

    public static function miteResourceName(bool $plural = false): string
    {
        if ($plural) {
            return Str::plural(strtolower(class_basename(static::class)));
        }
        return strtolower(class_basename(static::class));
    }

    public function scopeNeedsMiteSync(Builder $query)
    {
        return $query->whereNull('last_synced_at')
            ->orWhere('last_synced_at', '<', now()->subDay());
    }

    public function scopeMiteSynced(Builder $query)
    {
        return $query->whereNotNull('last_synced_at');
    }

    public function scopeNotMiteSynced(Builder $query)
    {
        return $query->whereNull('last_synced_at');
    }

    public function scopeMiteSyncedToday(Builder $query)
    {
        return $query->where('last_synced_at', '>=', now()->startOfDay());
    }

    public static function miteGetAll(MiteAccess $miteAccess, $query = []) : \Illuminate\Support\Collection
    {
        $mite = $miteAccess->mite();

        $endpoint = '/' . static::miteResourceName(true) . '.json';

        $response = $mite->get($endpoint, $query);
        
        if (array_key_exists('error', $response)) {
            throw new \Exception($response['error']);
        }
        
        $objects = collect();
        
        // iterate over all entries in the response
        // and create a new model instance for each entry
        foreach ($response as $miteData) {
            $miteData = $miteData[static::miteResourceName()];

            $model = static::newFromMite($miteData, $miteAccess);
            $model->last_sync_at = now();

            $objects->push($model);
        }

        return $objects;
    }

    public static function getMiteQuery(MiteAccess $miteAccess, $query)
    {
        return $query;
    }

    public function syncBack()
    {
        $miteAccess = $this->miteAccess;
        /** @var MiteApiClient $mite */
        $mite = $miteAccess->mite();

        if ($this->mite_id) {
            Log::info('Updating entry in mite', ['entry' => $this->toArray()]);
            $endpoint = '/' . static::miteResourceName(true) . '/' . $this->mite_id . '.json';
            // if the model has a mite_id, update the entry
            $response = $mite->patch($endpoint, [
                static::miteResourceName() => $this->toMite()
            ]);

            if ($response != null && $response->getStatusCode() != 200) {
                throw new \Exception($response->getBody());
            }
        } else {
            Log::info('Creating entry in mite', ['entry' => $this->toArray()]);
            $endpoint = '/' . static::miteResourceName(true) . '.json';
            // if the model does not have a mite_id, create the entry
            $response = $mite->post($endpoint, [
                static::miteResourceName() => $this->toMite()
            ]);

            if (array_key_exists('error', $response)) {
                throw new \Exception($response['error']);
            }

            // update the model with the mite_id
            $mite_data = $response[static::miteResourceName()];

            $this->fill(static::newFromMite($mite_data, $miteAccess)->toArray());
        }

        $this->last_sync_at = now();

        $this->save();

        return $response;
    }

    public function deleteFromMite()
    {
        $miteAccess = $this->miteAccess;
        /** @var MiteApiClient $mite */
        $mite = $miteAccess->mite();

        $endpoint = '/' . static::miteResourceName(true) . '/' . $this->mite_id . '.json';

        $response = $mite->delete($endpoint);

        if ($response != null && $response->getStatusCode() != 200) {
            throw new \Exception($response->getBody());
        }
    }
}
<?php

namespace App\Traits;

use App\Models\MiteAccess;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

trait HasMiteSync
{
    public function syncWithMite()
    {
        $mite = $this->miteAccess->mite();

        $miteModel = $this->getMiteModel();

        $miteData = $mite->get($this->mite_id);

        $this->fill($miteModel::fromMite($miteData)->toArray());

        $this->last_synced_at = now();

        $this->save();
    }

    public function getMiteModel()
    {
        return 'App\Models\\' . class_basename($this);
    }

    abstract public static function fromMite($mite_data, MiteAccess $miteAccess);
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

    public static function miteGetAll(MiteAccess $miteAccess, $query = [])
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

            $model = static::fromMite($miteData, $miteAccess);
            $model->last_sync_at = now();

            $objects->push($model);
        }

        return $objects;
    }

    public static function getMiteQuery(MiteAccess $miteAccess, $query)
    {
        return $query;
    }
}
<?php

namespace App\Models;

use App\Http\Resources\MiteAccessResource;
use App\Services\MiteApiClient;
use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiteAccess extends Model
{
    use HasFactory, Uuid;

    public $fillable = [
        'access_token',
        'name',
        'user_id'
    ];

    public $hidden = [
        'access_token'
    ];

    public function toResource() {
        return new MiteAccessResource($this);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function customers() {
        return $this->hasMany(Customer::class);
    }

    public function services() {
        return $this->hasMany(Service::class);
    }

    public function projects() {
        return $this->hasManyThrough(Project::class, Customer::class);
    }

    public function entries() {
        return $this->hasMany(Entry::class);
    }

    public function mite() : MiteApiClient {
        // build a mite client
        return new MiteApiClient($this->access_token);
    }
}

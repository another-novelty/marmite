<?php

namespace App\Models;

use App\Http\Resources\MiteAccessResource;
use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiteAccess extends Model
{
    use HasFactory, Uuid;

    public $fillable = [
        'access_token'
    ];

    public function toResource() {
        return new MiteAccessResource($this);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}

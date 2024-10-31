<?php

namespace App\Models;

use App\Traits\Uuid;
use App\Traits\Archivable;
use App\Traits\HasMiteSync;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory, Uuid, Archivable, HasMiteSync;

    protected $fillable = [
        'mite_id',
        'name',
        'note',
        'archived',
        'mite_access_id',
        'last_sync_at',
    ];

    protected $casts = [
        'archived' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    protected $dates = [
        'last_synced_at',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function miteAccess()
    {
        return $this->belongsTo(MiteAccess::class);
    }

    public function entries()
    {
        return $this->hasManyThrough(Entry::class, Project::class);
    }

    public static function newFromMite($mite_data, MiteAccess $miteAccess): Customer
    {
        // create a new customer from json data
        return new Customer(
            [
                'mite_id' => $mite_data['id'],
                'name' => $mite_data['name'],
                'note' => $mite_data['note'],
                'archived' => $mite_data['archived'],
            ]
        );
    }

    public function toMite(): array
    {
        return [
                'id' => $this->mite_id,
                'name' => $this->name,
                'note' => $this->note,
                'archived' => $this->archived,
        ];
    }
}

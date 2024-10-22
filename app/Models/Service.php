<?php

namespace App\Models;

use App\Traits\Archivable;
use App\Traits\HasMiteSync;
use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory, Uuid, Archivable, HasMiteSync;

    protected $fillable = [
        'mite_id',
        'name',
        'note',
        'archived',
        'access_token_id',
    ];

    protected $casts = [
        'archived' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    
    protected $dates = [
        'last_synced_at',
    ];

    public function entries()
    {
        return $this->hasMany(Entry::class);
    }

    public function MiteAccess()
    {
        return $this->belongsTo(MiteAccess::class);
    }

    public static function fromMite($mite_data, MiteAccess $miteAccess): Service
    {
        return new Service(
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

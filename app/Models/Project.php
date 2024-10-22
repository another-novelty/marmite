<?php

namespace App\Models;

use App\Traits\Uuid;
use App\Traits\Archivable;
use App\Traits\HasMiteSync;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory, Uuid, Archivable, HasMiteSync;

    protected $fillable = [
        'mite_id',
        'customer_id',
        'name',
        'note',
        'archived',
        'last_sync_at',
    ];

    protected $casts = [
        'archived' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    protected $dates = [
        'last_synced_at',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function entries()
    {
        return $this->hasMany(Entry::class);
    }

    public static function fromMite($mite_data, MiteAccess $miteAccess): Project
    {
        return new Project(
            [
                'mite_id' => $mite_data['id'],
                'customer_id' => Customer::where('mite_id', $mite_data['customer_id'])->where('mite_access_id', $miteAccess->id)->first()->id,
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
            'customer_id' => $this->customer->mite_id,
        ];
    }
}

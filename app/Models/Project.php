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
    ];

    protected $casts = [
        'archived' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    protected $dates = [
        'last_synced_at',
    ];

    protected static function boot()
    {
        parent::boot();
        Uuid::boot();

        static::addGlobalScope('active', function ($query) {
            $query->where($query->getModel()->getTable() . '.archived', false);
        });
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function entries()
    {
        return $this->hasMany(Entry::class);
    }

    public static function fromMite($mite_data)
    {
        return new Project(
            [
                'mite_id' => $mite_data['id'],
                'name' => $mite_data['name'],
                'note' => $mite_data['note'],
                'archived' => $mite_data['archived'],
            ]
        );
    }
}

<?php

namespace App\Models;

use App\Http\Resources\EntryResource;
use App\Traits\Uuid;
use App\Traits\HasMiteSync;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    use HasFactory, Uuid, HasMiteSync;

    protected $fillable = [
        'mite_id',
        'project_id',
        'service_id',
        'date',
        'minutes',
        'note',
        'locked',
    ];

    protected $casts = [
        'locked' => 'boolean',
        'date_at' => 'date',
        'last_synced_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public static function fromMite($mite_data)
    {
        return new Entry(
            [
                'mite_id' => $mite_data['id'],
                'project_id' => $mite_data['project_id'],
                'service_id' => $mite_data['service_id'],
                'date_at' => $mite_data['date_at'],
                'minutes' => $mite_data['minutes'],
                'note' => $mite_data['note'],
                'locked' => $mite_data['locked'],
            ]
        );
    }

    public function toMite()
    {
        return [
            'id' => $this->mite_id,
            'project_id' => $this->project_id,
            'service_id' => $this->service_id,
            'date_at' => $this->date_at,
            'minutes' => $this->minutes,
            'note' => $this->note,
            'locked' => $this->locked,
        ];
    }

    public function toResource()
    {
        return new EntryResource($this);
    }
}

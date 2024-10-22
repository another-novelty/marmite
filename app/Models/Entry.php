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
        'date_at',
        'minutes',
        'note',
        'locked',
        'last_sync_at',
    ];

    protected $casts = [
        'locked' => 'boolean',
        'date_at' => 'date',
        'last_sync_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public static function fromMite($mite_data, MiteAccess $miteAccess): Entry
    {
        $customer = Customer::where('mite_id', $mite_data['customer_id'])->where('mite_access_id', $miteAccess->id)->first();
        $project = Project::where('mite_id', $mite_data['project_id'])->where('customer_id', $customer->id)->first();
        $service = Service::where('mite_id', $mite_data['service_id'])->where('mite_access_id', $miteAccess->id)->first();
        return new Entry(
            [
                'mite_id' => $mite_data['id'],
                'project_id' => $project->id,
                'service_id' => $service->id,
                'date_at' => $mite_data['date_at'],
                'minutes' => $mite_data['minutes'],
                'note' => $mite_data['note'],
                'locked' => $mite_data['locked'],
            ]
        );
    }

    public function toMite(): array
    {
        return [
            'id' => $this->mite_id,
            'project_id' => $this->project->mite_id,
            'service_id' => $this->service->mite_id,
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

    public static function miteResourceName(bool $plural = false): string
    {
        if ($plural) {
            return 'time_entries';
        }
        return 'time_entry';
    }

    public static function getMiteQuery(MiteAccess $miteAccess, $query)
    {
        // merge query with default query parameters
        return array_merge(
            [
                'user_ud' => 'current',
            ],
            $query
        );
    }
}

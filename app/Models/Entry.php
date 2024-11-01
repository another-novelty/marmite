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
        'mite_access_id',
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

    public function miteAccess()
    {
        return $this->belongsTo(MiteAccess::class);
    }

    public static function newFromMite($mite_data, MiteAccess $miteAccess): Entry
    {
        $project_id = null;
        if (isset($mite_data['customer_id']) && isset($mite_data['project_id'])) {
            $customer = Customer::where('mite_id', $mite_data['customer_id'])->where('mite_access_id', $miteAccess->id)->first();
            if ($customer ) {
                $project = Project::where('mite_id', $mite_data['project_id'])->where('customer_id', $customer->id)->first();
                $project_id = $project->id;
            }
        }

        $service_id = null;
        if (isset($mite_data['service_id'])) {
            $service = Service::where('mite_id', $mite_data['service_id'])->where('mite_access_id', $miteAccess->id)->first();
            $service_id = $service->id;
        }
        
        return new Entry(
            [
                'mite_id' => $mite_data['id'],
                'project_id' => $project_id,
                'service_id' => $service_id,
                'date_at' => $mite_data['date_at'],
                'minutes' => $mite_data['minutes'],
                'note' => $mite_data['note'],
                'locked' => $mite_data['locked'],
                'mite_access_id' => $miteAccess->id,
            ]
        );
    }

    public function toMite(): array
    {
        $project_id = null;
        if ($this->project) {
            $project_id = $this->project->mite_id;
        }

        $service_id = null;
        if ($this->service) {
            $service_id = $this->service->mite_id;
        }

        return [
            'id' => $this->mite_id,
            'project_id' => $project_id,
            'service_id' => $service_id,
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

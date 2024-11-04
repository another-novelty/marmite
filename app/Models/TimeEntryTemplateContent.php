<?php

namespace App\Models;

use App\Traits\Uuid;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeEntryTemplateContent extends Model
{
    use HasFactory, Uuid;

    protected $fillable = ['time_entry_template_id', 'project_id', 'service_id', 'note', 'minutes'];

    public function template()
    {
        return $this->belongsTo(TimeEntryTemplate::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function apply(Carbon $date_at, bool $save = false): Entry {
        $entry = new Entry();
        $entry->date_at = $date_at;
        $entry->project_id = $this->project_id;
        $entry->service_id = $this->service_id;
        $entry->note = $this->note;
        $entry->minutes = $this->minutes;
        if ($save) {
            $entry->save();
        }
        return $entry;
    }
}

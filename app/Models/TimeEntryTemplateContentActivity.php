<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeEntryTemplateContentActivity extends Model
{
    use HasFactory, Uuid;

    protected $fillable = ['time_entry_template_content_id', 'name', 'description', 'minutes', 'priority', 'is_always_active', 'is_random_allowed', 'cron_expression'];

    protected $casts = [
        'is_always_active' => 'boolean',
        'is_random_allowed' => 'boolean',
        'start_time' => 'datetime:H:i:s',
    ];

    public function timeEntryTemplateContent()
    {
        return $this->belongsTo(TimeEntryTemplateContent::class);
    }

    public function timeEntryTemplate()
    {
        return $this->hasOneThrough(TimeEntryTemplate::class,
            TimeEntryTemplateContent::class,
            'id',
            'id',
            'time_entry_template_content_id',
            'time_entry_template_id'
        );
    }
}

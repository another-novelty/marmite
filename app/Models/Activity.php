<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory, Uuid;

    protected $fillable = ['content_id', 'name', 'description', 'minutes', 'priority', 'is_always_active', 'is_random_allowed', 'cron_expression'];

    protected $casts = [
        'is_always_active' => 'boolean',
        'is_random_allowed' => 'boolean',
        'start_time' => 'datetime:H:i:s',
    ];

    public function Content()
    {
        return $this->belongsTo(Content::class);
    }

    public function Template()
    {
        return $this->hasOneThrough(Template::class,
            Content::class,
            'id',
            'id',
            'content_id',
            'template_id'
        );
    }
}

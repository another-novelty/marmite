<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Cron\CronExpression;
use Dotenv\Util\Str;

class Content extends Model
{
    use HasFactory, Uuid;

    protected $fillable = ['template_id', 'name', 'description', 'project_id', 'service_id', 'minutes', 'start_time', 'pause_time', 'jitter_minutes', 'jitter_increments', 'n_activities'];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    protected $appends = ['end_time', 'note'];

    protected $with = ['activities', 'project', 'service'];

    public function template()
    {
        return $this->belongsTo(Template::class, 'template_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function end_time()
    {
        return $this->start_time->addMinutes($this->minutes + $this->pause_time)->format('H:i');
    }

    public function getEndTimeAttribute(): string
    {
        return $this->end_time();
    }

    public function note($n_activities = 0, Carbon $date_at = null): string
    {
        if ($date_at == null) {
            // TODO check if time zones are handled correctly
            $date_at = Carbon::today();
        }
        $activities = $this->activities;

        $start_time = $this->start_time;
        if ($this->jitter_minutes > 0) {
            $jitter = rand( - $this->jitter_minutes, $this->jitter_minutes);
            // round jitter to nearest multiple of jitter_increments
            $jitter = round($jitter / $this->jitter_increments) * $this->jitter_increments;
            $start_time = $start_time->addMinutes($jitter);
        }

        $end_time = $this->end_time();
        
        $note = '(' . $this->start_time->format('H:i') . '-' . $end_time . ')';
        if ($activities->count() == 0) {
            return $note;
        }

        $mandatory_activities = $activities->where('is_always_active', true);

        // add optional activities where the cron expression matches the date
        $date_format = $date_at->format('Y-m-d');
        $optional_activities = $activities->filter(function ($activity) use ($date_at) {
            $cron_expression = $activity->cron_expression;
            if ($cron_expression == null) {
                return false;
            }
            // TODO check if the cron expression is valid
            $cron = new CronExpression($cron_expression);
            // TODO check if time zones are handled correctly
            return $cron->isDue($date_at);
        });

        $mandatory_activities = $mandatory_activities->merge($optional_activities);

        $n_mandatory_activities = $mandatory_activities->count();

        if ($n_mandatory_activities > 0) {
            $note .= ' ';
            $note .= $mandatory_activities->shuffle()->take($n_mandatory_activities)->implode('name', ', ');
        }

        if ($n_activities > $n_mandatory_activities) {
            // fill up with random optional activities
            $optional_activities = $activities->where('is_always_active', false)
                ->take($n_activities - $n_mandatory_activities)
                ->shuffle();

            if ($optional_activities->count() > 0) {
                $note .= ' ';
                $note .= $optional_activities->implode('name', ', ');
            }
        }

        return $note;
    }

    public function getNoteAttribute() : string {
        return $this->note();
    }

    public function apply(Carbon $date_at, bool $save = false): Entry {
        $entry = new Entry();
        $entry->date_at = $date_at;
        $entry->project_id = $this->project_id;
        $entry->service_id = $this->service_id;
        $entry->note = $this->note($this->n_activities, $date_at);
        $entry->minutes = $this->minutes;
        if ($save) {
            $entry->save();
        }
        return $entry;
    }
}

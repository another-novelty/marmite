<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncJob extends Model
{
    use HasFactory, Uuid;

    public $fillable = [
        'mite_access_id',
        'clear',
        'sync_back',
        'started_at',
        'finished_at',
        'error'
    ];

    public function miteAccess() {
        return $this->belongsTo(MiteAccess::class);
    }

    public function startNow() {
        $this->started_at = now();
        $this->save();
    }

    public function finishNow() {
        $this->finished_at = now();
        $this->save();
    }

    public function logError(string $error) {
        $this->error = $error;
        $this->save();
    }

    public function wasSuccessful() {
        return $this->error === null;
    }

    public function isRunning() {
        return $this->started_at !== null && $this->finished_at === null;
    }

    public function isFinished() {
        return $this->finished_at !== null;
    }
}

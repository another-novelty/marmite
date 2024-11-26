<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Relations\Pivot;

class EntryTemplate extends Pivot
{
    use Uuid;

    protected $fillable = ['applied'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function entry()
    {
        return $this->belongsTo(Entry::class);
    }
}

<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeEntryTemplate extends Model
{
    use HasFactory, Uuid;

    protected $fillable = ['name', 'description', 'mite_access_id'];

    protected $with = ['contents'];
    
    public function contents()
    {
        return $this->hasMany(TimeEntryTemplateContent::class);
    }

    public function miteAccess()
    {
        return $this->belongsTo(MiteAccess::class);
    }

    public function user()
    {
        return $this->hasOneThrough(User::class, MiteAccess::class);
    }
}

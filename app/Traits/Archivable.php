<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Archivable
{
    public function scopeActive(Builder $query)
    {
        return $query->where($this->getTable() . '.archived', false);
    }

    public function scopeArchived(Builder $query)
    {
        return $query->where($this->getTable() . '.archived', true);
    }
}
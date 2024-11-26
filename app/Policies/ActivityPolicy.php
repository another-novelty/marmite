<?php

namespace App\Policies;

use App\Models\Content;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ActivityPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Activity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Content $content): bool
    {
        return $user->id === $content->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Activity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Activity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Activity $timeEntryTemplateContentActivity): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Activity $timeEntryTemplateContentActivity): bool
    {
        return false;
    }
}

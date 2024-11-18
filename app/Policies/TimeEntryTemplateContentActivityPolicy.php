<?php

namespace App\Policies;

use App\Models\TimeEntryTemplateContent;
use App\Models\TimeEntryTemplateContentActivity;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TimeEntryTemplateContentActivityPolicy
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
    public function view(User $user, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, TimeEntryTemplateContent $content): bool
    {
        return $user->id === $content->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity): bool
    {
        return $user->id === $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->miteAccess->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity): bool
    {
        return false;
    }
}

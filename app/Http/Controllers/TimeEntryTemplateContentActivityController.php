<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeEntryTemplateContentActivityRequest;
use App\Http\Requests\UpdateTimeEntryTemplateContentActivityRequest;
use App\Models\TimeEntryTemplateContent;
use App\Models\TimeEntryTemplateContentActivity;

class TimeEntryTemplateContentActivityController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTimeEntryTemplateContentActivityRequest $request)
    {
        $content = TimeEntryTemplateContent::findOrFail($request->time_entry_template_content_id);
        // check if the user can create the template content activity
        if (auth()->user()->cannot('create', [TimeEntryTemplateContentActivity::class, $content])) {
            abort(403);
        }

        // create the new template content activity
        $activity = TimeEntryTemplateContentActivity::create($request->validated());

        // return to the template edit page
        return redirect()->route('templates.edit', [$activity->timeEntryTemplateContent->timeEntryTemplate->mite_access_id, $activity->timeEntryTemplateContent->timeEntryTemplate->id, 'selectedTemplateContentId' => $activity->timeEntryTemplateContent->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeEntryTemplateContentActivityRequest $request, TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity)
    {
        // check if the user can update the template content activity
        if (auth()->user()->cannot('update', $timeEntryTemplateContentActivity)) {
            abort(403);
        }

        $timeEntryTemplateContentActivity->update($request->validated());

        // return to the template edit page
        return redirect()->route('templates.edit', [$timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->mite_access_id, $timeEntryTemplateContentActivity->timeEntryTemplateContent->timeEntryTemplate->id, 'selectedTemplateContentId' => $timeEntryTemplateContentActivity->timeEntryTemplateContent->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeEntryTemplateContentActivity $timeEntryTemplateContentActivity)
    {
        // check if the user can delete the template content activity
        if (auth()->user()->cannot('delete', $timeEntryTemplateContentActivity)) {
            abort(403);
        }

        $templateContent = $timeEntryTemplateContentActivity->timeEntryTemplateContent;
        $template = $templateContent->timeEntryTemplate;
        $timeEntryTemplateContentActivity->delete();

        // return to the template edit page
        return redirect()->route('templates.edit', [$template->mite_access_id, $template->id, 'selectedTemplateContentId' => $templateContent->id]);
    }   
}

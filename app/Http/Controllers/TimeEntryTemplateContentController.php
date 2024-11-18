<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeEntryTemplateContentRequest;
use App\Http\Requests\UpdateTimeEntryTemplateContentRequest;
use App\Models\TimeEntryTemplateContent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Ramsey\Uuid\Type\Time;

class TimeEntryTemplateContentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTimeEntryTemplateContentRequest $request)
    {
        // check if the user can create new template content
        if ($request->user()->cannot('create', TimeEntryTemplateContent::class)) {
            abort(403);
        }

        $templateContent = TimeEntryTemplateContent::create($request->validated());

        $template = $templateContent->template;
        $mite_access = $template->miteAccess;
        
        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();

        return Inertia::render('Templates/Edit',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'template' => $template,
                'selectedTemplateContent' => $templateContent,
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeEntryTemplateContentRequest $request, TimeEntryTemplateContent $timeEntryTemplateContent)
    {
        // check if the user can update the template content
        if ($request->user()->cannot('update', $timeEntryTemplateContent)) {
            abort(403);
        }

        $timeEntryTemplateContent->update($request->validated());
        $timeEntryTemplateContent->save();

        $template = $timeEntryTemplateContent->template;
        $mite_access = $template->miteAccess;

        return redirect()->route('templates.edit', [$mite_access->id, $template->id, 'selectedTemplateContentId' => $timeEntryTemplateContent->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, TimeEntryTemplateContent $timeEntryTemplateContent)
    {
        // check if the user can delete the template content
        if ($request->user()->cannot('delete', $timeEntryTemplateContent)) {
            abort(403);
        }

        $timeEntryTemplateContent->delete();

        return redirect()->route('templates.show', [$timeEntryTemplateContent->template->mite_access_id, $timeEntryTemplateContent->template->id]);
    }
}

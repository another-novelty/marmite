<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Content;
use App\Models\Activity;

class ActivityController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreActivityRequest $request)
    {
        $content = Content::findOrFail($request->content_id);
        // check if the user can create the template content activity
        if (auth()->user()->cannot('create', [Activity::class, $content])) {
            abort(403);
        }

        // create the new template content activity
        $activity = Activity::create($request->validated());

        // return to the template edit page
        return redirect()->route('template.edit', [$activity->content->template->mite_access_id, $activity->content->template->id, 'selectedContent' => $activity->content->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateActivityRequest $request, Activity $activity)
    {
        // check if the user can update the template content activity
        if (auth()->user()->cannot('update', $activity)) {
            abort(403);
        }

        $activity->update($request->validated());

        // return to the template edit page
        return redirect()->route('template.edit', [$activity->content->template->mite_access_id, $activity->content->template->id, 'selectedContent' => $activity->content->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity)
    {
        // check if the user can delete the template content activity
        if (auth()->user()->cannot('delete', $activity)) {
            abort(403);
        }

        $content = $activity->content;
        $template = $content->template;
        $activity->delete();

        // return to the template edit page
        return redirect()->route('template.edit', [$template->mite_access_id, $template->id, 'selectedContent' => $content->id]);
    }   
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContentRequest;
use App\Http\Requests\UpdateContentRequest;
use App\Models\Content;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Ramsey\Uuid\Type\Time;

class ContentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContentRequest $request)
    {
        // check if the user can create new template content
        if ($request->user()->cannot('create', Content::class)) {
            abort(403);
        }

        $templateContent = Content::create($request->validated());

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
    public function update(UpdateContentRequest $request, Content $content)
    {
        // check if the user can update the template content
        if ($request->user()->cannot('update', $content)) {
            abort(403);
        }

        $content->update($request->validated());
        $content->save();

        $template = $content->template;
        $mite_access = $template->miteAccess;

        return redirect()->route('template.edit', [$mite_access->id, $template->id, 'selectedContentId' => $content->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Content $content)
    {
        // check if the user can delete the template content
        if ($request->user()->cannot('delete', $content)) {
            abort(403);
        }

        $template = $content->template;

        $content->delete();

        return redirect()->route('template.show', [$content->template->mite_access_id, $template->id]);
    }
}

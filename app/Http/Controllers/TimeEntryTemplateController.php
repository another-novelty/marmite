<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use App\Models\TimeEntryTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TimeEntryTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(MiteAccess $mite_access)
    {
        #$mite_access = MiteAccess::find($mite_access_id);
        if ($mite_access == null) {
            abort(404);
        }

        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();
        $templates = $mite_access->templates()->with("contents")->get();

        return Inertia::render('Templates/Index',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'templates' => $templates,
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(MiteAccess $mite_access)
    {
        
        #$mite_access = MiteAccess::find($mite_access_id);
        if ($mite_access == null) {
            abort(404);
        }

        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();

        return Inertia::render('Templates/Create',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MiteAccess $mite_access, Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $template = new TimeEntryTemplate();
        $template->name = $request->name;
        $template->description = $request->description;
        $template->mite_access_id = $mite_access->id;
        $template->save();

        return redirect()->route('templates.show', [$mite_access->id, $template->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(MiteAccess $mite_access, TimeEntryTemplate $template)
    {
        return redirect()->route('templates.edit', [$mite_access->id, $template->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, MiteAccess $mite_access, TimeEntryTemplate $template)
    {
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();

        if ($request->selectedTemplateContentId) {
            $selectedTemplateContent = $template->contents->where('id', $request->selectedTemplateContentId)->first();
            if ($selectedTemplateContent == null) {
                return redirect()->route('templates.edit', [$mite_access->id, $template->id]);
            }
        } else {
            $selectedTemplateContent = null;
        }

        return Inertia::render('Templates/Edit',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'template' => $template,
                'selectedTemplateContent' => $selectedTemplateContent,
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TimeEntryTemplate $timeEntryTemplate)
    {
        $mite_access = $timeEntryTemplate->mite_access;
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // TODO also update activities

        $timeEntryTemplate->name = $request->name;
        $timeEntryTemplate->description = $request->description;
        $timeEntryTemplate->save();

        return redirect()->route('templates.show', [$mite_access->id, $timeEntryTemplate->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MiteAccess $mite_access, TimeEntryTemplate $template)
    {
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }
        Log::info("Deleting template " . $template);

        $template->delete();

        return redirect()->route('templates.index', $mite_access->id);
    }
}

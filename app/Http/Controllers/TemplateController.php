<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TemplateController extends Controller
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

        $template = new Template();
        $template->name = $request->name;
        $template->description = $request->description;
        $template->mite_access_id = $mite_access->id;
        $template->save();

        return redirect()->route('template.show', [$mite_access->id, $template->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(MiteAccess $mite_access, Template $template)
    {
        return redirect()->route('template.edit', [$mite_access->id, $template->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, MiteAccess $mite_access, Template $template)
    {
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();

        if ($request->selectedContentId) {
            $selectedContent = $template->contents->where('id', $request->selectedContentId)->first();
            if ($selectedContent == null) {
                return redirect()->route('template.edit', [$mite_access->id, $template->id]);
            }
        } else {
            $selectedContent = null;
        }

        return Inertia::render('Templates/Edit',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'template' => $template,
                'selectedContent' => $selectedContent,
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MiteAccess $mite_access, Template $template)
    {
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // TODO also update activities

        $template->name = $request->name;
        $template->description = $request->description;
        $template->save();

        return redirect()->route('template.show', [$mite_access->id, $template->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MiteAccess $mite_access, Template $template)
    {
        if ($mite_access->user_id != auth()->id()) {
            abort(403);
        }
        Log::info("Deleting template " . $template);

        $template->delete();

        return redirect()->route('template.index', $mite_access->id);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function show(string $id)
    {
        $mite_access = MiteAccess::find($id);

        $projects = $mite_access->projects()->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKey' => $mite_access,
                'projects' => $projects,
            ]
        );
    }
}

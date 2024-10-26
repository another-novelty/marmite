<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMiteAccessRequest;
use App\Http\Requests\UpdateMiteAccessRequest;
use App\Jobs\SyncMiteJob;
use App\Models\MiteAccess;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class MiteAccessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Auth::user()->miteAccesses->toResource();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Redirect::route('profile.edit');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMiteAccessRequest $request)
    {
        $miteAccess = new MiteAccess($request->validated());
        $miteAccess->user_id = Auth::id();
        $miteAccess->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Display the specified resource.
     */
    public function show(MiteAccess $miteAccess)
    {
        return inertia('MiteAccess/Show', [
            'miteAccess' => $miteAccess->toResource(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MiteAccess $miteAccess)
    {
        return Redirect::route('profile.edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMiteAccessRequest $request, MiteAccess $miteAccess)
    {
        $miteAccess->update($request->validated());

        return Redirect::route('profile.edit');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MiteAccess $miteAccess)
    {
        $miteAccess->delete();

        return Redirect::route('profile.edit');
    }

    /**
     * Sync the specified resource with mite.
     */
    public function sync(MiteAccess $miteAccess){
        // TODO: Async with response per websocket
        SyncMiteJob::dispatchSync($miteAccess, true);

        return Redirect::back()
            ->with('success', 'Syncing with mite...');
    }
}

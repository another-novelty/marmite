<?php

namespace Database\Seeders;

use App\Models\MiteAccess;
use App\Models\TimeEntryTemplate;
use App\Models\TimeEntryTemplateContent;
use App\Models\TimeEntryTemplateContentActivity;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TimeEntryTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // check if users exist
        $users = User::all();
        if ($users->count() == 0) {
            $this->call(UserSeeder::class);
            $users = User::all();
        }

        $users->each(function (User $user) {
            // get all mite accesses for this user
            $miteAccesses = $user->miteAccesses;
            if ($miteAccesses->count() == 0) {
                // TODO: create mite access
                return;
            }
            $miteAccesses->each(function (MiteAccess $miteAccess) {
                $miteAccess->templates()->saveMany(TimeEntryTemplate::factory(3)->make());
                $miteAccess->templates
                ->each(function (TimeEntryTemplate $template) use ($miteAccess) {
                    // get all projects and services for this mite access
                    $projects = $miteAccess->projects;
                    $services = $miteAccess->services;

                    if ($projects->count() == 0 || $services->count() == 0) {
                        // TODO: create projects and services
                        return;
                    }

                    $template->contents()->create([
                        'name' => 'Default Content',
                        'description' => 'Default content for time entries',
                        'project_id' => $projects->first()->id,
                        'service_id' => $services->first()->id,
                        'minutes' => 480,
                        'start_time' => '09:00:00',
                    ])
                    ->each(function (TimeEntryTemplateContent $content) {
                        $content->activities()->saveMany(TimeEntryTemplateContentActivity::factory(3)->make());
                    });
                });
            });
        });
    }
}

<?php

namespace Database\Factories;

use App\Models\TimeEntryTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeEntryTemplateContent>
 */
class TimeEntryTemplateContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // get a random time entry template id
        $timeEntryTemplate = TimeEntryTemplate::inRandomOrder()->first();

        // get a random project id or set to null
        $projectId = null;
        if ($this->faker->boolean()) {
            $projectId = $timeEntryTemplate->miteAccess->projects()->inRandomOrder()->first()->id;
        }

        // get a random service id or set to null
        $serviceId = null;
        if ($this->faker->boolean()) {
            $serviceId = $timeEntryTemplate->miteAccess->services()->inRandomOrder()->first()->id;
        }
        
        return [
            'time_entry_template_id' => $timeEntryTemplate->id,
            'name' => 'Time Entry Template Content ' . random_int(1, 100),
            'description' => $this->faker->text(),
            'project_id' => $projectId,
            'service_id' => $serviceId,
            'minutes' => random_int(1, 500),
            'start_time' => $this->faker->time(),
            'pause_time' => $this->faker->time('H:i:s', '02:00:00'),
            'jitter_minutes' => random_int(0, 100),
            'jitter_increments' => random_int(1, 100),
            'n_activities' => random_int(0, 5),
        ];
    }
}

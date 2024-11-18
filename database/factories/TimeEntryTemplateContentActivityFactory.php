<?php

namespace Database\Factories;

use App\Models\TimeEntryTemplateContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeEntryTemplateContentActivity>
 */
class TimeEntryTemplateContentActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // get a random time entry template content id
        $timeEntryTemplateContentId = TimeEntryTemplateContent::inRandomOrder()->first()->id;

        $cronExpression = null;
        if ($this->faker->boolean()) {
            $cronExpression = "* * * * *";
        }
        return [
            'time_entry_template_content_id' => $timeEntryTemplateContentId,
            'name' => "Activity " . random_int(1, 100),
            "is_always_active" => $this->faker->boolean(),
            "is_random_allowed" => $this->faker->boolean(),
            "description" => $this->faker->text(),
            "cron_expression" => $cronExpression,
        ];
    }
}

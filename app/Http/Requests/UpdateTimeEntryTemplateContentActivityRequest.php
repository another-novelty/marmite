<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimeEntryTemplateContentActivityRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => 'required|exists:time_entry_template_content_activities',
            'time_entry_template_content_id' => 'required|exists:time_entry_template_contents,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'minutes' => 'nullable|integer|min:0',
            'priority' => 'nullable|integer|min:0',
            'is_always_active' => 'boolean',
            'is_random_allowed' => 'boolean',
            'cron_expression' => 'nullable|string|max:255',
        ];
    }
}
